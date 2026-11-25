import { test, expect, Page } from "@playwright/test";
import { JaUtils_basicProgram } from "./jaUtils";
import { startpage, PlaywrightUtils_disableTours, PlaywrightUtils_selectBuiltin } from "../playwrightUtils";

async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const urls: string[] = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg.includes("externalimages")) {
        urls.push(bg);
      }
      if (
        el instanceof HTMLImageElement &&
        (el.src.includes("externalimages") || (el.complete && el.naturalWidth === 0))
      ) {
        urls.push(el.src);
      }
    }
    return urls;
  });
}

test("works without a subscription and shows no server-only entry points", async ({ page }) => {
  const failedLocal: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedLocal.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(startpage + "?skipintro=1&lang=en");
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await expect(page.getByText("Import from link")).toHaveCount(0);
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-graphs").click();
  await page.getByTestId("dashboard-generate-starter").click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId("unlock")).toHaveCount(0);
  await expect(page.getByTestId("screen-subscription")).toHaveCount(0);

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await expect(page.getByTestId("set-plates").first()).toBeVisible();
  expect(await brokenImages(page)).toEqual([]);

  await page.getByTestId("footer-me").click();
  await expect(page.getByTestId("menu-item-export-data-to-json-file")).toBeVisible();
  await expect(page.getByTestId("menu-item-import-data-from-json-file")).toBeVisible();
  for (const id of ["menu-item-account", "menu-item-friends", "menu-item-api-keys", "menu-item-nickname"]) {
    await expect(page.getByTestId(id)).toHaveCount(0);
  }
  await page.getByTestId("menu-item-muscle-groups").click();
  await page.waitForTimeout(500);
  expect(await brokenImages(page)).toEqual([]);

  expect(failedLocal.filter((u) => !u.includes("externalimages"))).toEqual([]);
  expect(failedLocal).toEqual([]);
});

test("the first screen has no sign-in entry", async ({ page }) => {
  await page.goto(startpage + "?lang=ja");
  await expect(page.locator(".ls-onboarding-start")).toBeVisible();
  await expect(page.locator(".ls-onboarding-have-account")).toHaveCount(0);
});
