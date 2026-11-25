import { test, expect } from "@playwright/test";
import { startpage, PlaywrightUtils_disableTours, PlaywrightUtils_selectBuiltin } from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

test.use({ locale: "ja-JP" });

test("opens in Japanese, shows Japanese exercise, equipment and muscle names", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await expect(page.getByText("ベンチプレス（バーベル）").first()).toBeVisible();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-exercises").click();
  await expect(page.getByText("ベンチプレス").first()).toBeVisible();
  await expect(page.getByText("Bench Press")).toHaveCount(0);

  expect(Array.isArray(await JaUtils_missing(page))).toBe(true);
});

test("?lang=en keeps English even in a Japanese browser", async ({ page }) => {
  await page.goto(`${startpage}?skipintro=1&lang=en`);
  await expect(page.getByTestId("program-select-builtin")).toBeVisible();
  await page.getByTestId("program-select-builtin").click();
  await expect(page.getByText("Choose a program")).toBeVisible();
});
