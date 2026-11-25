import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_clearCodeMirror,
  PlaywrightUtils_createProgram,
  PlaywrightUtils_disableTours,
  PlaywrightUtils_typeCodeMirror,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

const scheme = process.env.SHOT_SCHEME === "dark" ? "dark" : "light";
test.use({ locale: "ja-JP", viewport: { width: 375, height: 812 }, colorScheme: scheme });

const userText = [
  "Liftosaur",
  "kg",
  "lb",
  "cm",
  "in",
  "ms",
  "My Program",
  "Intro Week",
  "Volume Week",
  "Push Day",
  "Pull Day",
];
const shots = ".work/developer-u5a";

const twoWeeks = `# Intro Week
## Push Day
Squat / 3x8 / 100lb

## Pull Day
Bench Press / 3x8 / 100lb

# Volume Week
## Push Day
Squat / 5x5 / 120lb

## Pull Day
Bench Press / 5x5 / 120lb`;

async function missingSince(page: Page, before: string[]): Promise<string[]> {
  const known = new Set(before);
  const now = await JaUtils_missing(page);
  return now.filter((m) => !known.has(m) && !userText.some((a) => m.includes(a)));
}

async function seedProgram(page: Page): Promise<void> {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-full-program").click();
  await PlaywrightUtils_clearCodeMirror(page, "planner-editor");
  await PlaywrightUtils_typeCodeMirror(page, "planner-editor", twoWeeks);
  await page.getByTestId("editor-v2-ui-program").click();
}

async function startBuiltinProgram(page: Page): Promise<void> {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await page.getByTestId("program-select-builtin").click();
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();
}

function collectDialogs(page: Page): string[] {
  const messages: string[] = [];
  page.on("dialog", (dialog) => {
    messages.push(dialog.message());
    return dialog.dismiss();
  });
  return messages;
}

test("exercise editor modal shows its unsaved-changes dialog in Japanese", async ({ page }) => {
  const dialogs = collectDialogs(page);
  await seedProgram(page);
  const before = await JaUtils_missing(page);

  await page.getByTestId("edit-exercise").first().click();
  const sheet = page.getByTestId("exercise-liftoeditor");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByTestId("exercise-liftoeditor-instance-1-1")).toHaveText("Intro Week · Push Day");
  await page.screenshot({ path: `${shots}/${scheme}-exercise-editor-modal.png` });

  await PlaywrightUtils_clearCodeMirror(page, "exercise-liftoeditor");
  await PlaywrightUtils_typeCodeMirror(page, "exercise-liftoeditor", "Squat / 9x9 / 100lb");
  await page.getByTestId("bottom-sheet-close").and(page.locator(":visible")).click();
  await expect.poll(() => dialogs.length).toBeGreaterThan(0);
  expect(dialogs[0]).toBe("この種目の未保存の変更を破棄しますか？");
  expect(await missingSince(page, before)).toEqual([]);
});

test("change-exercise modal is Japanese", async ({ page }) => {
  await seedProgram(page);
  const before = await JaUtils_missing(page);

  await page.getByTestId("exercise-squat_barbell").getByTestId("edit-exercise-swap").click();
  await expect(page.getByTestId("edit-exercise-change-all")).toHaveText("プログラム全体");
  await expect(page.getByTestId("edit-exercise-change-one")).toHaveText("この週・日のみ");
  await expect(page.getByText("種目を変更", { exact: true })).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-change-exercise.png` });
  expect(await missingSince(page, before)).toEqual([]);
});

test("dashboards modal and its rename and delete prompts are Japanese", async ({ page }) => {
  const dialogs = collectDialogs(page);
  await startBuiltinProgram(page);
  await page.getByTestId("footer-graphs").click();
  await page.getByTestId("dashboard-generate-starter").click();
  await page.waitForTimeout(500);
  const before = await JaUtils_missing(page);

  await page.getByTestId("dashboard-edit").locator("xpath=preceding::*[contains(@class,'text-lg')][1]").click();
  await expect(page.getByText("新規ダッシュボード")).toBeVisible();
  await expect(page.getByText("ダッシュボード", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-dashboards-modal.png` });

  await page.locator("[data-testid^='dashboards-delete-']").first().click();
  await expect.poll(() => dialogs.length).toBeGreaterThan(0);
  expect(dialogs[0]).toMatch(/^ダッシュボード「.+」を削除しますか？$/);

  expect(await missingSince(page, before)).toEqual([]);

  await page.locator("[data-testid^='dashboards-rename-']").first().click();
  await expect(page.getByText("ダッシュボード名を変更")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-dashboards-rename.png` });
});

test("amrap modal, program day from an adhoc workout and create-program modal open in Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-empty-workout").click();
  await page.getByTestId("exercise-filter-by-name").fill("Bench Press");
  await page.getByTestId("menu-item-bench-press-barbell").click();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("add-workout-set").click();
  await page.getByTestId("complete-set").first().click();
  await expect(page.locator("#modal").getByText("完了", { exact: true })).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-amrap-modal.png` });
  await page.locator("#modal").getByText("完了", { exact: true }).click();
  await page.getByTestId("finish-workout").click();
  const before = await JaUtils_missing(page);

  await page.getByTestId("create-program-day").click();
  await expect(page.getByText("ワークアウトからプログラムの日を作成").first()).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-day-from-adhoc.png` });
  await page.getByTestId("create-program-from-adhoc").click();
  await expect(page.getByTestId("modal-create-program-input")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-create-program-from-adhoc.png` });
  console.log("OTHER-UNIT-MISSING-ADHOC", JSON.stringify(await missingSince(page, before)));
});

test("debug modal is Japanese", async ({ page }) => {
  await startBuiltinProgram(page);
  await page.getByTestId("footer-me").click();
  const before = await JaUtils_missing(page);
  const title = page.locator("[class*='text-lg'][class*='font-semibold']").first();
  for (let i = 0; i < 5; i++) {
    await title.click();
  }
  await expect(page.getByText("ネットワーク通信")).toBeVisible();
  await expect(page.getByText("デバッグ情報を送信")).toBeVisible();
  await expect(page.getByText("管理者アクセス")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-debug.png` });
  expect(await missingSince(page, before)).toEqual([]);
});
