import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_disableTours,
  PlaywrightUtils_selectBuiltin,
  PlaywrightUtils_finishExercise,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_basicProgram, JaUtils_missing } from "./jaUtils";

const shots = process.env.JA_SHOTS ?? ".work/developer-merge/shots";

async function shot(page: Page, scheme: string, name: string): Promise<void> {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/${scheme}-${name}.png` });
}

async function isOneLine(page: Page, testId: string): Promise<boolean> {
  return page.getByTestId(testId).evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const tops = new Set<number>();
    for (let node = walker.nextNode(); node != null; node = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(node);
      Array.from(range.getClientRects()).forEach((r) => tops.add(Math.round(r.top)));
    }
    return tops.size === 1;
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(scheme, () => {
    test.use({ locale: "ja-JP", viewport: { width: 375, height: 812 }, colorScheme: scheme });

    test(`program playground uses the same set table headings (${scheme})`, async ({ page }) => {
      await JaUtils_open(page);
      await PlaywrightUtils_disableTours(page);
      await PlaywrightUtils_selectBuiltin(page);
      await page.getByRole("button", { name: JaUtils_basicProgram }).click();
      await page.getByTestId("preview-program").click();
      await page.getByTestId("menu-item-value-enable-playground").click();
      await shot(page, scheme, "program-playground");
      await expect(page.locator("body")).toContainText("目標");
      await expect(page.locator("body")).not.toContainText("セット主動筋");
    });

    test(`merged screens keep their layout (${scheme})`, async ({ page }) => {
      page.on("dialog", (d) => d.accept());
      await JaUtils_open(page);
      await PlaywrightUtils_disableTours(page);
      await PlaywrightUtils_selectBuiltin(page);
      await shot(page, scheme, "program-list");
      await page.getByRole("button", { name: JaUtils_basicProgram }).click();
      await page.getByTestId("clone-program").click();
      await shot(page, scheme, "home");

      await page.getByTestId("footer-workout").click();
      await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
      await expect(page.locator("body")).toContainText("目標");
      await expect(page.locator("body")).toContainText("回数");
      await expect(page.locator("body")).not.toContainText("セット主動筋");
      await shot(page, scheme, "workout");

      await page.getByTestId("workout-tab-bent-over-row").click();
      const entry = page.getByTestId("entry-bent-over-row");
      await entry.getByTestId("complete-set").nth(1).click();
      await entry.getByTestId("complete-set").nth(2).click();
      await entry.getByTestId("complete-set").nth(3).click();
      await expect(page.getByTestId("modal-amrap-clear")).toBeVisible();
      await shot(page, scheme, "amrap");
      expect(await isOneLine(page, "modal-amrap-clear")).toBe(true);
      expect(await isOneLine(page, "modal-amrap-submit")).toBe(true);
      await page.getByTestId("modal-amrap-input").fill("5");
      await page.getByTestId("modal-amrap-submit").click();
      await PlaywrightUtils_finishExercise(page, "bench-press", [1, 1, { amrap: { reps: 5 } }]);
      await PlaywrightUtils_finishExercise(page, "squat", [1, 1, { amrap: { reps: 5 } }]);

      await page.getByTestId("add-exercise-button").click();
      await shot(page, scheme, "exercise-picker");
      await page.getByText("閉じる", { exact: true }).last().click();

      await page.getByTestId("finish-workout").click();
      await expect(page.getByTestId("totals-summary")).toBeVisible();
      await shot(page, scheme, "finish");
      expect((await page.getByTestId("totals-summary-volume").boundingBox())!.height).toBeLessThan(30);
      await page.getByTestId("finish-day-continue").click();

      await page.getByTestId("footer-graphs").click();
      await page.getByTestId("dashboard-generate-starter").click();
      await expect(page.getByTestId("dashboard-graph")).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText("Strength");
      await shot(page, scheme, "dashboard");

      await page.getByTestId("footer-me").click();
      await shot(page, scheme, "me");
      await page.getByTestId("menu-item-1rm-formula").click();
      await shot(page, scheme, "1rm-formula");
      await page.getByTestId("navbar-back").last().click();
      await page.getByTestId("menu-item-exercises").click();
      await page.getByText("ベンチプレス").first().click();
      await shot(page, scheme, "exercise-stats");
      await page.getByTestId("navbar-back").last().click();
      await page.getByTestId("navbar-back").last().click();
      await page.getByTestId("menu-item-available-equipment").click();
      await page.getByTestId("group-header-barbell").click();
      await shot(page, scheme, "equipment");
      await page.getByTestId("menu-item-value-type").first().scrollIntoViewIfNeeded();
      await shot(page, scheme, "equipment-type");

      const missing = (await JaUtils_missing(page)).filter(
        (m) => !["Liftosaur", "kg", "lb", "cm", "in", "PR", "Workout A", "Workout B"].includes(m)
      );
      expect(missing).toEqual([]);
    });
  });
}
