import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_disableTours,
  PlaywrightUtils_finishExercise,
  PlaywrightUtils_selectBuiltin,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

test.use({
  locale: "ja-JP",
  viewport: { width: 375, height: 812 },
  colorScheme: process.env.JA_SCHEME === "dark" ? "dark" : "light",
});

const shotDir = process.env.JA_SHOTS;

async function shot(page: Page, name: string): Promise<void> {
  if (shotDir != null) {
    await page.screenshot({ path: `${shotDir}/${name}.png` });
  }
}

test("statistics and history screens are in Japanese", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);

  await PlaywrightUtils_selectBuiltin(page);
  await page.locator("button").filter({ hasText: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-measurements").click();
  await expect(page.getByText("計測値はまだ追加されていません")).toBeVisible();
  await shot(page, "measurements-empty");
  await page.getByTestId("add-measurements").click();
  await page.getByTestId("input-stats-bodyweight").fill("70");
  await page.getByTestId("add-stats").click();
  await expect(page.getByText("計測の一覧")).toBeVisible();
  await expect(page.getByText("計測の種類")).toBeVisible();
  await shot(page, "measurements-list");
  await page.getByTestId("delete-stat").first().click();
  await expect(page.getByText("計測値はまだ追加されていません")).toBeVisible();

  await page.getByTestId("navbar-back").click();
  await page.getByTestId("menu-item-muscle-groups").click();
  await expect(page.getByText("自作の筋群を追加")).toBeVisible();
  await shot(page, "muscle-groups");
  await page.getByTestId("add-muscle-group").click();
  await expect(page.getByText("新しいグループ名を入力")).toBeVisible();
  await shot(page, "muscle-groups-add");
  await page.getByTestId("modal-new-muscle-group-cancel").click();

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await page.getByTestId("workout-menu").click();
  await page.getByTestId("workout-menu-muscles").click();
  await expect(page.getByText("筋肉の使われ方（相対）")).toBeVisible();
  await expect(page.getByText("種目一覧（筋力）")).toBeVisible();
  await shot(page, "muscles-day");
  await page.getByTestId("navbar-back").click();
  await PlaywrightUtils_finishExercise(page, "bent-over-row", [0, 1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "bench-press", [1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "squat", [1, 1, { amrap: { reps: 5 } }]);
  await page.getByTestId("finish-workout").click();
  await page.getByTestId("finish-day-continue").click();

  await page.getByTestId("footer-home").click();
  await expect(page.getByTestId("history-record").first()).toBeVisible();
  await expect(page.getByTestId("history-record-date").first()).toBeVisible();
  await shot(page, "history");
  await page.getByTestId("toggle-week-insights").first().click();
  await expect(page.getByText("セット範囲の設定を変更")).toBeVisible();
  await shot(page, "week-insights");
  await page.getByTestId("modal-close").and(page.locator(":visible")).click();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-exercises").click();
  await page.getByText("ベントオーバーロウ").first().click();
  await page.mouse.wheel(0, 3000);
  await shot(page, "exercise-stats");
  await page.getByTestId("footer-graphs").click();
  await page.getByTestId("dashboard-generate-starter").click();
  await expect(page.getByTestId("dashboard-graph")).toHaveCount(1);
  await expect(page.getByText("最新").first()).toBeVisible();
  await expect(page.getByTestId("dashboard-graph-range-3M")).toContainText("3か月");
  await page.getByTestId("dashboard-graph-range-3M").click();
  await expect(page.getByTestId("dashboard-graph-range-All")).toContainText("すべて");
  await shot(page, "dashboard");

  await page.getByTestId("dashboard-edit").and(page.locator(":visible")).click();
  await expect(page.getByTestId("dashboard-edit-view")).toBeVisible();
  await shot(page, "dashboard-edit");
  await page.getByTestId("dashboard-edit-menu-0").first().click();
  await shot(page, "dashboard-edit-menu");
  await page.getByTestId("dashboard-edit-menu-edit").click();
  await expect(page.getByTestId("dashboard-widget-cancel")).toBeVisible();
  await shot(page, "dashboard-widget-form");
  await page.getByTestId("dashboard-widget-cancel").click();

  const graphSlot = page
    .locator('[data-testid^="dashboard-edit-slot-"]')
    .filter({ has: page.getByTestId("dashboard-graph") });
  await graphSlot.getByTestId(/^dashboard-edit-menu-\d+$/).click();
  await page.getByTestId("dashboard-edit-menu-edit").click();
  await expect(page.getByTestId("dashboard-widget-add-series")).toBeVisible();
  await shot(page, "dashboard-graph-form");
  await page.getByTestId("dashboard-widget-series-0").click();
  await shot(page, "dashboard-series-form");
  await page.getByTestId("dashboard-widget-series-back").click();
  await page.getByTestId("dashboard-widget-cancel").click();
  await page
    .getByTestId(/^dashboard-edit-add-widget-\d+$/)
    .first()
    .click();
  await shot(page, "dashboard-add-widget");

  const missing = await JaUtils_missing(page);
  expect(
    missing.filter((text) => !["Liftosaur", "kg", "lb", "cm", "in", "PR", "Workout A", "Workout B"].includes(text))
  ).toEqual([]);
});
