import { test, expect, Page } from "@playwright/test";
import { JaUtils_open } from "./jaUtils";
import { PlaywrightUtils_disableTours, PlaywrightUtils_selectBuiltin } from "../playwrightUtils";

test.use({ locale: "ja-JP" });

async function openPicker(page: Page): Promise<void> {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByPlaceholder("名前で検索").fill("ベーシックビギナー");
  await page
    .getByRole("button", { name: /ベーシックビギナールーティン/ })
    .first()
    .click();
  await page.getByTestId("clone-program").click();
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-empty-workout").click();
  await expect(page.getByTestId("exercise-filter-by-name")).toBeVisible();
}

function firstRow(page: Page): Promise<string | null> {
  return page.locator('[data-testid^="menu-item-"]').first().getAttribute("data-testid");
}

test("the exercise list waits for the IME to confirm before filtering", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "IME composition is driven through the Chromium DevTools protocol");
  await openPicker(page);
  const before = await firstRow(page);
  await page.getByTestId("exercise-filter-by-name").click();
  const cdp = await page.context().newCDPSession(page);
  for (const text of ["す", "すく", "すくわ"]) {
    await cdp.send("Input.imeSetComposition", { text, selectionStart: text.length, selectionEnd: text.length });
  }
  await page.waitForTimeout(800);
  await expect(page.getByTestId("exercise-filter-by-name")).toHaveValue("すくわ");
  expect(await firstRow(page)).toEqual(before);

  await cdp.send("Input.insertText", { text: "スクワット" });
  await expect(page.getByTestId("menu-item-squat-barbell")).toBeVisible();
  expect(await firstRow(page)).not.toEqual(before);
  await expect(page.getByTestId("exercise-filter-by-name")).toHaveValue("スクワット");
});

test("typing letters or kana without an IME still filters the list", async ({ page }) => {
  await openPicker(page);
  await page.getByTestId("exercise-filter-by-name").fill("bench press");
  await expect(page.getByTestId("menu-item-bench-press-barbell")).toBeVisible();
  await page.getByTestId("exercise-filter-by-name").fill("すくわっと");
  await expect(page.getByTestId("menu-item-squat-barbell")).toBeVisible();
  await expect(page.getByTestId("menu-item-bench-press-barbell")).toHaveCount(0);
  await page.getByTestId("exercise-filter-by-name").fill("zzzz");
  await expect(page.locator('[data-testid^="menu-item-"]')).toHaveCount(0);
});
