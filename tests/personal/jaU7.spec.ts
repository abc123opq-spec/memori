import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_disableTours,
  PlaywrightUtils_finishExercise,
  PlaywrightUtils_selectBuiltin,
  PlaywrightUtils_clearCodeMirror,
  PlaywrightUtils_typeCodeMirror,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

test.use({
  locale: "ja-JP",
  viewport: { width: 375, height: 812 },
  colorScheme: process.env.JA_SCHEME === "dark" ? "dark" : "light",
});

const shots = process.env.JA_SHOTS;
const allow = [
  "Liftosaur",
  "kg",
  "lb",
  "cm",
  "in",
  "Basic Beginner Routine",
  "Day 1",
  "Day 2",
  "RPE",
  "AMRAP",
  "RIR",
  "PR",
  "nSuns LP",
  "EZバー",
  "Workout A",
  "Workout B",
  "My Program",
];
const seen = new Set<string>();

async function snap(page: Page, label: string): Promise<void> {
  const missing = await JaUtils_missing(page);
  const fresh = missing.filter((m) => !seen.has(m) && !allow.some((a) => m === a || m.includes(a)));
  fresh.forEach((m) => seen.add(m));
  if (fresh.length > 0) {
    console.log(`MISSING after ${label}: ${JSON.stringify(fresh)}`);
  }
  const mine = fresh;
  expect(mine, label).toEqual([]);
  if (shots) {
    await page.screenshot({ path: `${shots}/${label.replace(/\s+/g, "-")}-${process.env.JA_SCHEME ?? "light"}.png` });
  }
}

async function absorb(page: Page): Promise<void> {
  (await JaUtils_missing(page)).forEach((m) => seen.add(m));
}

test("footer, menu items, selects and dialogs are Japanese", async ({ page }) => {
  seen.clear();
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await expect(page.getByText("プログラムを選びましょう")).toBeVisible();
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await snap(page, "choose program");
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await snap(page, "program info");
  await page.getByTestId("clone-program").click();
  await absorb(page);

  for (const [id, label] of [
    ["home", "ホーム"],
    ["program", "プログラム"],
    ["graphs", "グラフ"],
    ["me", "マイページ"],
  ]) {
    await expect(page.getByTestId("footer-" + id).getByText(label, { exact: true })).toBeVisible();
    const box = await page.getByTestId("footer-" + id).boundingBox();
    expect(box?.height ?? 0, id).toBeLessThan(70);
  }
  await expect(page.getByText("ワークアウト", { exact: true }).last()).toBeVisible();
  await snap(page, "home");

  await page.getByTestId("footer-me").click();
  await expect(page.getByText("マイ計測")).toBeVisible();
  await snap(page, "me");
  await expect(page.getByText("重量の単位")).toBeVisible();
  await expect(page.getByText("週の開始日：")).toBeVisible();

  await page.getByTestId("menu-item-timers").click();
  await snap(page, "timers");
  await expect(page.getByText("秒").first()).toBeVisible();
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-exercises").click();
  await page.getByText("ベンチプレス").first().click();
  await expect(page.getByTestId("exercise-stats-image")).toBeAttached();
  await snap(page, "exercise stats");
  await page.getByTestId("navbar-back").last().click();
  await snap(page, "exercises");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-available-equipment").click();
  await snap(page, "equipment");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("footer-graphs").click();
  await snap(page, "graphs");

  await page.getByTestId("footer-workout").click();
  await snap(page, "new workout sheet");
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await snap(page, "workout");
  await PlaywrightUtils_finishExercise(page, "bent-over-row", [0, 1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "bench-press", [1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "squat", [1, 1, { amrap: { reps: 5 } }]);
  await page.getByTestId("finish-workout").click();
  await expect(page.getByTestId("totals-summary")).toBeVisible();
  await snap(page, "finish day");
  await page.getByTestId("finish-day-continue").click();
  await snap(page, "after finish");
  await page.getByTestId("footer-program").click();
  await snap(page, "program");
});

test("modals, sheets and the editor are Japanese", async ({ page }) => {
  seen.clear();
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await page.getByTestId("program-select-create").click();
  await expect(page.getByText("プログラム名")).toBeVisible();
  await snap(page, "create program modal");
  await page.getByTestId("modal-create-program-input").fill("My Program");
  await page.getByTestId("modal-create-program-submit").click();
  await absorb(page);

  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-full-program").click();
  await PlaywrightUtils_clearCodeMirror(page, "planner-editor");
  await PlaywrightUtils_typeCodeMirror(
    page,
    "planner-editor",
    `# Week 1
## Day 1
Squat / 1x8 / 80% / progress: lp(5lb)
Bench Press / 3x5+ 100lb @8`
  );
  await page.getByTestId("save-program").click();
  await absorb(page);

  await page.getByTestId("footer-workout").click();
  await snap(page, "new workout sheet");
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await snap(page, "workout");

  await page.getByTestId("exercise-rm1-picker").click();
  await snap(page, "rm1 modal");
  await page.getByTestId("onerm-calculator").click();
  await expect(page.getByText("レップマックス計算")).toBeVisible();
  await snap(page, "rep max calculator");
  await page.getByTestId("rep-max-calculator-back").click();
  await absorb(page);
  await page
    .locator("[data-name=overlay]")
    .last()
    .click({ position: { x: 5, y: 5 } });

  await page.getByTestId("exercise-options").first().click();
  await snap(page, "exercise options");
  await page.keyboard.press("Escape");

  await page.getByTestId("workout-tab-bench-press").click();
  await page.getByTestId("entry-bench-press").getByTestId("complete-set").nth(2).click();
  await expect(page.getByTestId("modal-amrap-submit")).toBeVisible();
  await snap(page, "amrap modal");
  await page.getByTestId("modal-amrap-submit").click();
  await absorb(page);

  await page.getByTestId("finish-workout").click();
  await expect(page.getByTestId("totals-summary")).toBeVisible();
  await snap(page, "finish day");
});

test("history, personal records and exercise settings are Japanese", async ({ page }) => {
  seen.clear();
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await page.getByTestId("program-select-create").click();
  await page.getByTestId("modal-create-program-input").fill("My Program");
  await page.getByTestId("modal-create-program-submit").click();
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-full-program").click();
  await PlaywrightUtils_clearCodeMirror(page, "planner-editor");
  await PlaywrightUtils_typeCodeMirror(
    page,
    "planner-editor",
    `# Week 1\n## Day 1\nSquat / 1x8 / 80% / progress: lp(5lb)\nBench Press / 3x5+ 100lb @8`
  );
  await page.getByTestId("save-program").click();
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await absorb(page);

  await PlaywrightUtils_finishExercise(page, "bench-press", [1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "squat", [1]);
  await page.getByTestId("finish-workout").click();
  await expect(page.getByTestId("totals-summary")).toBeVisible();
  await snap(page, "finish day");
  await page.getByTestId("finish-day-continue").click();
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-exercises").click();
  await snap(page, "exercises list");
  await page.getByText("ベンチプレス").first().click();
  await expect(page.getByTestId("exercise-stats-history")).toBeVisible();
  await snap(page, "exercise stats with history");
  await page.getByTestId("exercise-stats-history-filter").click();
  await snap(page, "history filters");
  await page.getByTestId("override-exercise-muscles").click();
  await snap(page, "muscles override");
  await page.keyboard.press("Escape");
});
