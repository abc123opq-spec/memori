import { test, expect, Page } from "@playwright/test";
import { PlaywrightUtils_disableTours } from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

const scheme = process.env.SHOT_SCHEME === "dark" ? "dark" : "light";
test.use({ locale: "ja-JP", viewport: { width: 375, height: 812 }, colorScheme: scheme });

const userText = ["Liftosaur", "kg", "lb", "cm", "in", "Basic Beginner Routine", "Workout A", "Workout B"];
const shots = ".work/developer-u5b";

async function missingSince(page: Page, before: string[]): Promise<string[]> {
  const known = new Set(before);
  const now = await JaUtils_missing(page);
  return now.filter((m) => !known.has(m) && !userText.some((a) => m.includes(a)));
}

async function closeModal(page: Page): Promise<void> {
  await page.locator("[data-testid=modal-close]:visible, [data-testid=bottom-sheet-close]:visible").last().click();
  await page.waitForTimeout(500);
}

async function startBuiltinProgram(page: Page): Promise<void> {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await page.getByTestId("program-select-builtin").click();
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();
}

test("superset picker modal is Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-empty-workout").click();
  await page.getByTestId("exercise-filter-by-name").fill("Bench Press");
  await page.getByTestId("menu-item-bench-press-barbell").click();
  await page.getByTestId("exercise-picker-confirm").click();
  const before = await JaUtils_missing(page);
  await page.getByTestId("exercise-options").click();
  await page.getByTestId("exercise-superset").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${scheme}-superset.png` });
  console.log("U5B-SUPERSET", JSON.stringify(await missingSince(page, before)));
});

test("new gym, new equipment and new plate modals are Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-available-equipment").click();
  const before = await JaUtils_missing(page);

  await page.getByTestId("add-new-equipment").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${scheme}-new-equipment.png` });
  await closeModal(page);

  await page.getByText("バーベル", { exact: true }).first().click();
  await page.getByTestId("equipment-plates-add").click();
  await expect(page.getByText("新しいプレートサイズ")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-new-plate.png` });
  await closeModal(page);
  await page.getByTestId("navbar-back").last().click();
  await page.getByTestId("add-new-gym").click();
  await page.getByTestId("new-gym").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${scheme}-new-gym.png` });
  console.log("U5B-EQUIP", JSON.stringify(await missingSince(page, before)));
});

test("program screen modals are Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-program").click();
  const before = await JaUtils_missing(page);

  await page.getByTestId("change-program-day").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${scheme}-program-next-day.png` });
  expect(await missingSince(page, before)).toEqual([]);
  await closeModal(page);

  await page.getByTestId("navbar-3-dot").click();
  await page.getByTestId("bottom-sheet-generate-image").click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/${scheme}-program-image.png` });
  console.log("U5B-PROGRAM", JSON.stringify(await missingSince(page, before)));
});

test("muscle group picker modal is Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-muscle-groups").click();
  await page.waitForTimeout(600);
  const before = await JaUtils_missing(page);
  await page.mouse.click(303, 95);
  await expect(page.getByText("筋肉を選択")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-muscle-picker.png` });
  expect(await missingSince(page, before)).toEqual([]);
});
