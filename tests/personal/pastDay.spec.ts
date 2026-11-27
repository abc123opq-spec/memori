import { test, expect, Page } from "@playwright/test";
import { JaUtils_open } from "./jaUtils";
import { PlaywrightUtils_disableTours, PlaywrightUtils_selectBuiltin } from "../playwrightUtils";

test.use({ locale: "ja-JP" });

async function startBasicBeginner(page: Page, day: number = 26): Promise<void> {
  await page.addInitScript((defaultDay) => {
    const RealDate = Date;
    let fakeDay = defaultDay;
    try {
      fakeDay = Number(window.localStorage.getItem("pw-fake-day") ?? defaultDay);
    } catch {}
    const shift = new RealDate(2026, 10, fakeDay, 9, 0).getTime() - RealDate.now();
    class ShiftedDate extends RealDate {
      constructor(...args: ConstructorParameters<DateConstructor> | []) {
        if (args.length === 0) {
          super(RealDate.now() + shift);
        } else {
          super(...(args as ConstructorParameters<DateConstructor>));
        }
      }
      public static now(): number {
        return RealDate.now() + shift;
      }
    }
    (globalThis as unknown as { Date: DateConstructor }).Date = ShiftedDate as unknown as DateConstructor;
  }, day);
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.getByPlaceholder("名前で検索").fill("ベーシックビギナー");
  await page
    .getByRole("button", { name: /ベーシックビギナールーティン/ })
    .first()
    .click();
  await page.getByTestId("clone-program").click();
  await page.getByTestId("footer-home").click();
}

function storageSummary(page: Page): Promise<{ history: string[]; nextDay: number | undefined }> {
  return page.evaluate(() => {
    const s = (
      window as unknown as {
        state: {
          storage: {
            history: { date: string; programId: string }[];
            programs: { id: string; nextDay: number }[];
            currentProgramId?: string;
          };
        };
      }
    ).state.storage;
    return {
      history: s.history.map((h) => `${h.date.slice(0, 10)}:${h.programId}`),
      nextDay: s.programs.find((p) => p.id === s.currentProgramId)?.nextDay,
    };
  });
}

test("a workout can be added afterwards for a past day from the home week strip", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await startBasicBeginner(page);
  const before = await storageSummary(page);

  await page.getByTestId("week-calendar-day-2026-11-26").click();
  await expect(page.getByTestId("home-add-past-workout")).toHaveCount(0);

  await JaUtils_open(page);
  await page.getByTestId("week-calendar-day-2026-11-24").click();
  await expect(page.getByTestId("home-add-past-workout")).toContainText("この日の記録を追加");
  await page.getByTestId("home-add-past-workout").click();

  await page.getByTestId("exercise-filter-by-name").fill("Squat");
  await page.getByTestId("menu-item-squat-barbell").click();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("entry-squat").getByTestId("add-workout-set").click();
  await page.getByTestId("finish-workout").click();

  await page.getByTestId("footer-home").click();
  await expect(page.getByTestId("history-record").filter({ hasText: "単発のワークアウト" })).toHaveCount(1);
  await expect(page.getByText("2026年11月24日").first()).toBeVisible();
  const after = await storageSummary(page);
  expect(after.history).toEqual([...before.history, "2026-11-24:emptyprogram"]);
  expect(after.nextDay).toEqual(before.nextDay);
});

test("this week stays in the strip when only past weeks have records", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await startBasicBeginner(page, 18);
  await page.evaluate(() => window.localStorage.setItem("pw-fake-day", "18"));
  const before = await storageSummary(page);
  await page.getByTestId("week-calendar-day-2026-11-17").click();
  await page.getByTestId("home-add-past-workout").click();
  await page.getByTestId("exercise-filter-by-name").fill("Squat");
  await page.getByTestId("menu-item-squat-barbell").click();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("entry-squat").getByTestId("add-workout-set").click();
  await page.getByTestId("finish-workout").click();
  await page.getByTestId("footer-home").click();
  await expect(page.getByTestId("history-record").filter({ hasText: "単発のワークアウト" })).toHaveCount(1);
  // Persistence writes 100ms after the last change; reloading sooner loses the record
  await page.waitForTimeout(500);

  await page.evaluate(() => window.localStorage.setItem("pw-fake-day", "26"));
  await JaUtils_open(page);
  await expect(page.getByTestId("week-calendar-day-2026-11-26")).toBeVisible();
  await page.getByTestId("week-calendar-day-2026-11-24").click();
  await page.getByTestId("home-add-past-workout").click();
  await page.getByTestId("exercise-filter-by-name").fill("Squat");
  await page.getByTestId("menu-item-squat-barbell").click();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("entry-squat").getByTestId("add-workout-set").click();
  await page.getByTestId("finish-workout").click();

  await page.getByTestId("footer-home").click();
  const after = await storageSummary(page);
  expect(after.history).toEqual([...before.history, "2026-11-24:emptyprogram", "2026-11-17:emptyprogram"]);
});

test("backing out of an added past-day workout leaves no record", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await startBasicBeginner(page);
  const before = await storageSummary(page);

  await page.getByTestId("week-calendar-day-2026-11-23").click();
  await page.getByTestId("home-add-past-workout").click();
  await expect(page.getByTestId("exercise-picker-confirm")).toBeVisible();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("navbar-back").click();
  await page.getByTestId("footer-home").click();

  const after = await storageSummary(page);
  expect(after).toEqual(before);
});
