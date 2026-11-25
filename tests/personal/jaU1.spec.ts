import { test, expect, Page } from "@playwright/test";
import { PlaywrightUtils_disableTours, PlaywrightUtils_createProgramWithCode } from "../playwrightUtils";
import { startpage } from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing } from "./jaUtils";

test.use({ locale: "ja-JP", viewport: { width: 375, height: 760 } });

const PROGRAM = `# Week 1
## Day 1
Bench Press / 3x5 100lb / warmup: 1x5 50% / progress: none
Squat / 3x1 100lb 30s|60s / warmup: none / progress: none
Deadlift / 3x5 @8 100lb / warmup: none / progress: none
`;

const ALLOW = ["Liftosaur", "kg", "lb", "cm", "in", "My Program", "Day 1", "RPE"];

async function newlyMissing(page: Page, before: string[]): Promise<string[]> {
  const known = new Set(before);
  return (await JaUtils_missing(page)).filter((text) => !known.has(text) && !ALLOW.some((a) => text === a));
}

const LONG_NAMES_PROGRAM = `# Week 1
## Day 1
Bench Press Close Grip / 3x5 100lb / warmup: none / progress: none
Bent Over One Arm Row / 3x5 50lb / warmup: none / progress: none
Bulgarian Split Squat / 3x5 50lb / warmup: none / progress: none
Kettlebell Turkish Get Up / 1x5 20lb / warmup: none / progress: none
Incline Bench Press Wide Grip / 3x5 50lb / warmup: none / progress: none
`;

async function startWorkout(page: Page, program: string = PROGRAM): Promise<string[]> {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgramWithCode(page, "My Program", program);
  await page.getByTestId("footer-workout").click();
  const before = await JaUtils_missing(page);
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await expect(page.getByTestId("exercise-name").first()).toBeVisible();
  return before;
}

test("workout screen, set rows and menus are in Japanese", async ({ page }) => {
  const before = await startWorkout(page);
  await expect(page.getByText("ベンチプレス（バーベル）").first()).toBeVisible();
  await expect(page.getByText("器具：").first()).toBeVisible();
  await expect(page.getByText("セットを追加").first()).toBeVisible();
  await expect(page.getByText("ウォームアップを追加").first()).toBeVisible();
  await expect(page.getByTestId("finish-workout")).toHaveText("終了");
  await expect(page.getByTestId("workout-elapsed")).toHaveText(/^\d{2}:\d{2}$/);
  await expect(page.getByText("回数", { exact: true }).first()).toBeVisible();

  await expect(page.getByText("「目標」をタップして表示を切り替えます。").first()).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/workout.png" });
  await page.getByTestId("complete-set").first().click();
  await page.screenshot({ path: ".work/developer-u1/rest-timer.png" });
  await page.getByTestId("rest-timer-collapsed").click();
  await expect(page.getByTestId("rest-timer-expanded")).toBeVisible();
  await page.getByTestId("rest-timer-back").click();

  await page.getByTestId("exercise-options").first().click();
  await expect(page.getByText("種目を入れ替え")).toBeVisible();
  await page.getByTestId("exercise-notes-toggle").click();
  await expect(page.getByPlaceholder("この種目のメモを追加…").first()).toBeVisible();
  await page.getByTestId("exercise-options").first().click();
  await page.getByTestId("exercise-notes-toggle").click();

  await page.getByTestId("workout-menu").click();
  await expect(page.getByText("ワークアウトを削除")).toBeVisible();
  await page.getByTestId("workout-menu-notes").click();
  await expect(page.getByPlaceholder("ワークアウトのメモを追加…")).toBeVisible();
  await page.getByTestId("workout-menu").click();
  await page.getByTestId("workout-menu-notes").click();

  await page.getByText("目標", { exact: true }).first().click();
  await expect(page.getByText("前回のセット", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/target-lasttime.png" });
  await page.getByText("前回のセット", { exact: true }).first().click();
  await page.screenshot({ path: ".work/developer-u1/target-next.png" });

  expect(await newlyMissing(page, before)).toEqual([]);
});

test("expanded set, RPE and timed set screens are in Japanese", async ({ page }) => {
  const before = await startWorkout(page);
  await page.getByTestId("workout-tab-deadlift").click();
  await page.getByTestId("complete-set").first().click();
  await page.screenshot({ path: ".work/developer-u1/deadlift.png" });

  await page.getByTestId("workout-tab-squat").click();
  await page.getByTestId("entry-squat").getByTestId("start-set-timer").first().click();
  await expect(page.getByTestId("set-timer-get-ready-current")).toBeVisible();
  await expect(page.getByText("準備")).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/set-timer-ready.png" });
  await page.getByTestId("set-timer-start-now").click();
  await expect(page.getByTestId("set-timer-current")).toBeVisible();
  await expect(page.getByText("停止して記録").first()).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/set-timer.png" });
  await page.getByTestId("set-timer-stop-record").click();
  await page.getByTestId("set-timer-value").first().click();
  await expect(page.getByText("記録時間を編集")).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/set-timer-edit.png" });
  await page.getByTestId("set-timer-edit-submit").click();

  expect(await newlyMissing(page, before)).toEqual([]);
});

for (const scheme of ["light", "dark"] as const) {
  test(`long exercise names stay inside the thumbnails (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await startWorkout(page, LONG_NAMES_PROGRAM);
    const tabs = page.locator('[data-testid^="workout-tab-"]');
    await expect(tabs).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const box = (await tabs.nth(i).boundingBox())!;
      const text = tabs.nth(i).locator("div[dir=auto]").first();
      const textBox = (await text.boundingBox())!;
      expect(textBox.x + textBox.width).toBeLessThanOrEqual(box.x + box.width);
      expect(textBox.y + textBox.height).toBeLessThanOrEqual(box.y + box.height);
    }
    await page.screenshot({ path: `.work/developer-u1/thumbnails-long-${scheme}.png` });
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`main workout screen (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await startWorkout(page);
    await page.screenshot({ path: `.work/developer-u1/workout-${scheme}.png` });
    await page.getByTestId("complete-set").first().click();
    await page.screenshot({ path: `.work/developer-u1/workout-rest-${scheme}.png` });
    await page.getByTestId("exercise-options").first().click();
    await page.screenshot({ path: `.work/developer-u1/kebab-${scheme}.png` });
  });
}

test("?lang=en keeps the English workout screen", async ({ page }) => {
  await page.goto(`${startpage}?skipintro=1&lang=en`);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgramWithCode(page, "My Program", LONG_NAMES_PROGRAM);
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await expect(page.getByText("Add Warmup Set").first()).toBeVisible();
  await expect(page.getByTestId("finish-workout")).toHaveText("Finish");
  await expect(page.getByText("Bulgarian Split Squat").first()).toBeVisible();
  await page.screenshot({ path: ".work/developer-u1/english-light.png" });
});
