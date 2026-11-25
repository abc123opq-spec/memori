import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_disableTours,
  PlaywrightUtils_selectBuiltin,
  PlaywrightUtils_createProgram,
  PlaywrightUtils_createProgramWithCode,
  PlaywrightUtils_clearCodeMirror,
  PlaywrightUtils_typeCodeMirror,
  PlaywrightUtils_finishExercise,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

test.use({ locale: "ja-JP" });

const PROGRAM = `# Week 1
## Day 1
Squat / 3x8 100lb / progress: lp(5lb, 1, 0)
Bench Press / 3x8 100lb / warmup: 1x5 50% / progress: dp(5lb, 8, 12)
Overhead Press / 3x8 50lb / progress: custom(rpe+: 0) {~
  if (state.rpe > 7) {
    weights -= 5lb
  }
~}

## Day 2
Deadlift / 3x5 120lb / progress: sum(15, 5lb)
Front Squat / 3x8 60lb / 3x5 70lb

# Week 2
## Day 1
Squat / 3x5 120lb
Bench Press / 3x5 120lb
`;

const USER_DATA = [
  "Liftosaur",
  "kg",
  "lb",
  "cm",
  "in",
  "My Program",
  "Week 1",
  "Week 2",
  "Day 1",
  "Day 2",
  "Squat",
  "Bench Press",
  "Overhead Press",
  "Deadlift",
  "Front Squat",
  "rpe",
];

const seen = new Set<string>();
const outsideUnit = new Set<string>();

async function markOtherUnits(page: Page): Promise<void> {
  await page.waitForTimeout(1500);
}

async function markCatalog(page: Page): Promise<void> {
  const catalog: { name: string; shortDescription: string; description: string }[] = await page.evaluate(() =>
    fetch("./programdata/index.json").then((r) => r.json())
  );
  catalog.forEach((p) => [p.name, p.shortDescription, p.description].forEach((x) => outsideUnit.add(x)));
  await markOtherUnits(page);
}

async function check(page: Page, label: string): Promise<void> {
  const all = await JaUtils_missing(page);
  const mine = all.filter((x) => !outsideUnit.has(x) && !USER_DATA.some((a) => x === a || x.includes(a)));
  const fresh = mine.filter((x) => !seen.has(x));
  fresh.forEach((x) => seen.add(x));
  expect(mine, label).toEqual([]);
}

test("preview and playground of a built-in program", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await markCatalog(page);
  await page.getByTestId("preview-program").click();
  await expect(page.getByTestId("program-author")).toHaveText("作者：/r/fitness");
  await page.screenshot({ path: ".work/developer-u2/builtin-preview.png" });
  const day = page.getByTestId("preview-day-workout-a").first();
  await day.getByTestId("bent-over-row").getByTestId("program-preview-edit-exercise").click();
  await page.screenshot({ path: ".work/developer-u2/playground-edit.png" });
  await page.getByTestId("modal-edit-mode-save-statvars").click();
  await page.getByTestId("menu-item-value-enable-playground").click();
  await page.screenshot({ path: ".work/developer-u2/builtin-playground.png" });
  await PlaywrightUtils_finishExercise(page, "bent-over-row", [0, 1, 1, { amrap: { reps: 5 } }], day);
  await page.screenshot({ path: ".work/developer-u2/builtin-playground-done.png" });
  await page.getByTestId("finish-day-details-playground").first().click();
  await page.screenshot({ path: ".work/developer-u2/builtin-finish-day.png" });
  await check(page, "builtin preview");
});

test("an unknown exercise in the full text offers to add it", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await markOtherUnits(page);
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-full-program").click();
  await PlaywrightUtils_clearCodeMirror(page, "planner-editor");
  await PlaywrightUtils_typeCodeMirror(page, "planner-editor", "# Week 1\n## Day 1\nZzzz Press / 3x5 50lb");
  await expect(page.getByText("自作種目を追加")).toBeVisible();
  await page.screenshot({ path: ".work/developer-u2/unknown-exercise.png" });
  await check(page, "unknown exercise");
});

test("edit a program in every mode", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgramWithCode(page, "My Program", PROGRAM);
  await markOtherUnits(page);
  await page.getByTestId("footer-program").click();
  await page.getByTestId("tab-edit").click();

  await page.getByTestId("editor-v2-ui-program").click();
  await page.getByTestId("collapse-all-days").click();
  await page.getByTestId("collapse-all-days").click();
  await page.getByTestId("collapse-all-exercises").first().click();
  await page.getByTestId("collapse-all-exercises").first().click();
  await page.screenshot({ path: ".work/developer-u2/ui-progress.png" });
  await check(page, "ui");

  await page.getByTestId("editor-v2-perday-program").click();
  await check(page, "perday");
  await page.getByTestId("editor-v2-full-program").click();
  await check(page, "full");

  await page.getByTestId("tab-preview").click();
  await check(page, "tab preview");
  await page.getByTestId("tab-playground").click();
  await page.screenshot({ path: ".work/developer-u2/tab-playground.png" });
  await check(page, "tab playground");
  await page.getByTestId("tab-edit").click();

  await page.getByTestId("editor-v2-grid-program").click();
  await page.getByTestId("grid-select-week-0").click();
  await page.getByTestId("grid-action-edit").click();
  await page.screenshot({ path: ".work/developer-u2/grid-edit-week.png" });
  await check(page, "grid edit week");
  await page.getByText("キャンセル").last().click();
  await page.getByTestId("grid-cell-Squat-0").click();
  await page.getByTestId("grid-action-more").click();
  await page.screenshot({ path: ".work/developer-u2/grid-more.png" });
  await check(page, "grid more");
});
