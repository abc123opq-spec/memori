import { test, expect, Page } from "@playwright/test";
import { startpage, PlaywrightUtils_disableTours, PlaywrightUtils_selectBuiltin } from "../playwrightUtils";

test.use({ locale: "ja-JP" });

const pounds = /\d\s?lbs?(?![A-Za-z])|ポンド/g;

async function expectNoPounds(page: Page, where: string): Promise<void> {
  await page.waitForTimeout(500);
  const text = await page.evaluate(() => document.body.innerText);
  expect(text.match(pounds) ?? [], where).toEqual([]);
}

test("Japanese onboarding, program and workout show weights in kg only", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(`${startpage}?lang=ja&nosync=true`);
  await PlaywrightUtils_disableTours(page);

  const settings = await page.evaluate(() => {
    const s = (window as unknown as { state: { storage: { settings: Record<string, unknown> } } }).state.storage
      .settings as { units: string; lengthUnits: string; gyms: { equipment: Record<string, unknown> }[] };
    return { units: s.units, lengthUnits: s.lengthUnits, barbell: JSON.stringify(s.gyms[0].equipment.barbell) };
  });
  expect(settings.units).toBe("kg");
  expect(settings.lengthUnits).toBe("cm");
  expect(settings.barbell).toMatch(/"bar":\{"value":20,"unit":"kg"\}|"value":20,"unit":"kg"/);

  await expectNoPounds(page, "first screen");
  await page.locator(".ls-onboarding-start").click();
  await expect(page.getByTestId("setup-equipment-skip")).toBeVisible();
  await expectNoPounds(page, "equipment");
  await page.locator(".ls-onboarding-equipment-setup").click();
  await expect(page.getByTestId("setup-plates-continue")).toBeVisible();
  await expectNoPounds(page, "plates");
  await page.getByTestId("setup-plates-continue").click();
  await expect(page.getByTestId("program-select-builtin")).toBeVisible();
  await expect(page.getByTestId("hear-about-us-option-reddit")).toHaveCount(0);

  await PlaywrightUtils_selectBuiltin(page);
  await page.getByPlaceholder("名前で検索").fill("ベーシックビギナールーティン");
  await page.getByRole("button", { name: "ベーシックビギナールーティン", exact: true }).click();
  await expect(page.getByTestId("clone-program")).toBeVisible();
  await expectNoPounds(page, "program info");

  await page.getByTestId("program-guide-open").click();
  await expect(page.getByTestId("program-guide")).toBeVisible();
  await expectNoPounds(page, "program guide");
  await page.getByTestId("guide-close").click();
  await page.getByRole("button", { name: "ベーシックビギナールーティン", exact: true }).click();

  await page.getByTestId("preview-program").click();
  await page.waitForTimeout(1500);
  await expectNoPounds(page, "preview");
  await page.screenshot({ path: ".work/developer-K/shots/e2e-preview.png" });
  await page.locator(`[data-testid="navbar-back"]:visible`).click();
  if (!(await page.getByTestId("clone-program").isVisible())) {
    await page.getByRole("button", { name: "ベーシックビギナールーティン", exact: true }).click();
  }

  await page.getByTestId("clone-program").click();
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await expect(page.getByTestId("complete-set").first()).toBeVisible();
  await expectNoPounds(page, "workout");
  expect(await page.evaluate(() => document.body.innerText)).toMatch(/\d\s?kg/);
  await page.getByTestId("complete-set").first().click();
  await expectNoPounds(page, "workout after a set");

  await page.getByTestId("footer-home").click();
  await expectNoPounds(page, "home");
});
