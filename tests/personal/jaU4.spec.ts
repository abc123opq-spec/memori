import { test, expect, Page } from "@playwright/test";
import {
  startpage,
  PlaywrightUtils_disableTours,
  PlaywrightUtils_finishExercise,
  PlaywrightUtils_selectBuiltin,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram } from "./jaUtils";

test.use({ locale: "ja-JP" });

const allow = ["Liftosaur", "kg", "lb", "cm", "in", "Day 1", "Day 2", "Workout A", "Workout B"];
const seen = new Set<string>();

async function snap(page: Page, label: string): Promise<void> {
  const missing = await JaUtils_missing(page);
  const fresh = missing.filter((m) => !seen.has(m) && !allow.some((a) => m === a || m.includes(a)));
  fresh.forEach((m) => seen.add(m));
  const mine = fresh;
  if (fresh.length > 0) {
    console.log(`MISSING after ${label}: ${JSON.stringify(fresh)}`);
  }
  expect(mine, label).toEqual([]);
}

async function absorb(page: Page): Promise<void> {
  (await JaUtils_missing(page)).forEach((m) => seen.add(m));
}

test("onboarding screens are Japanese", async ({ page }) => {
  seen.clear();
  await page.goto(`${startpage}?lang=ja`);
  await expect(page.getByText("はじめる")).toBeVisible();
  await snap(page, "first");
  await page.getByText("はじめる").click();
  await expect(page.getByText("どんな器具がありますか？")).toBeVisible();
  await snap(page, "setup equipment");
  await page.getByText("プレートを設定", { exact: true }).click();
  await expect(page.getByText("プレートを設定しましょう")).toBeVisible();
  await snap(page, "setup plates");
});

test("me and workout screens are Japanese", async ({ page }) => {
  seen.clear();
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await expect(page.getByText("プログラムを選びましょう")).toBeVisible();
  await snap(page, "program select");
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();
  await absorb(page);

  await page.getByTestId("footer-me").click();
  await expect(page.getByText("マイ計測")).toBeVisible();
  await snap(page, "me");

  await page.getByTestId("menu-item-measurements").click();
  await snap(page, "measurements");
  await page.getByTestId("add-measurements").click();
  await expect(page.getByText("すべての項目は任意です", { exact: false })).toBeVisible();
  await snap(page, "add measurements");
  await page.getByTestId("navbar-back").last().click();
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-sleep-&-nutrition").click();
  await snap(page, "sleep nutrition");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-exercises").click();
  await snap(page, "exercises");
  await page.getByText("ベンチプレス").first().click();
  await expect(page.getByTestId("exercise-stats-image")).toBeAttached();
  await snap(page, "exercise stats");
  await page.getByTestId("navbar-back").last().click();
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-muscle-groups").click();
  await snap(page, "muscle groups");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-timers").click();
  await snap(page, "timers");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-1rm-formula").click();
  await snap(page, "1rm formula");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("menu-item-available-equipment").click();
  await snap(page, "equipment");
  await page.getByTestId("add-new-gym").click();
  await snap(page, "gyms");
  await page.getByTestId("navbar-back").last().click();
  await page.getByTestId("group-header-barbell").click();
  await snap(page, "equipment detail");
  await page.getByTestId("navbar-back").last().click();
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("footer-graphs").click();
  await snap(page, "dashboard");
  await page.getByTestId("dashboard-edit").click();
  await snap(page, "dashboard edit");
  await page.getByTestId("navbar-back").last().click();

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await snap(page, "workout");
  await PlaywrightUtils_finishExercise(page, "bent-over-row", [0, 1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "bench-press", [1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "squat", [1, 1, { amrap: { reps: 5 } }]);
  await page.getByTestId("finish-workout").click();
  await expect(page.getByTestId("totals-summary")).toBeVisible();
  await snap(page, "finish day");
  await page.getByTestId("finish-day-continue").click();
});

test("program preview and 1RM screens are Japanese", async ({ page }) => {
  seen.clear();
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByRole("button", { name: "nSuns LP" }).first().click();
  await absorb(page);
  await page.getByTestId("preview-program").click();
  await expect(page.getByText("プログラムのプレビュー")).toBeVisible();
  await snap(page, "program preview");
  await page.getByTestId("navbar-back").last().click();

  await page.getByRole("button", { name: "nSuns LP" }).first().click();
  await page.waitForTimeout(1500);
  await absorb(page);
  await page.getByTestId("clone-program").click();
  await expect(page.getByText("1RMの設定")).toBeVisible();
  await snap(page, "1rm");
  await page.getByTestId("continue-1rms").click();
});
