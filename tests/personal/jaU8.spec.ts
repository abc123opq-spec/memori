import { test, expect, Page } from "@playwright/test";
import {
  PlaywrightUtils_disableTours,
  PlaywrightUtils_finishExercise,
  PlaywrightUtils_selectBuiltin,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing, JaUtils_basicProgram, JaUtils_withoutProgramTexts } from "./jaUtils";

test.use({
  locale: "ja-JP",
  viewport: { width: 375, height: 812 },
  colorScheme: process.env.JA_SCHEME === "dark" ? "dark" : "light",
});

const shotDir = process.env.JA_SHOTS;
const JAPANESE = /[぀-ヿ㐀-鿿＀-￯]/;

const ALLOW = ["Liftosaur", "kg", "lb", "cm", "in", "PR", "e1RM", "Workout A", "Workout B"];

async function shot(page: Page, name: string): Promise<void> {
  if (shotDir != null) {
    await page.screenshot({ path: `${shotDir}/${name}.png` });
  }
}

async function readStoredData(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const parts: string[] = [];
    const databases = (await indexedDB.databases?.()) ?? [];
    for (const info of databases) {
      if (info.name == null) {
        continue;
      }
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        const request = indexedDB.open(info.name as string);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      for (const storeName of Array.from(db.objectStoreNames)) {
        const values: unknown[] = await new Promise((resolve, reject) => {
          const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        parts.push(JSON.stringify(values));
      }
      db.close();
    }
    parts.push(JSON.stringify(Object.entries(localStorage)));
    return parts.join("\n");
  });
}

test("models and utils show Japanese, and nothing Japanese is stored", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.accept();
  });
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.locator("button").filter({ hasText: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await PlaywrightUtils_finishExercise(page, "bent-over-row", [0, 1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "bench-press", [1, 1, { amrap: { reps: 5 } }]);
  await PlaywrightUtils_finishExercise(page, "squat", [1, 1, { amrap: { reps: 5 } }]);
  await page.getByTestId("finish-workout").click();
  await page.getByTestId("finish-day-continue").click();

  await page.getByTestId("footer-home").click();
  await expect(page.getByTestId("history-record").first()).toBeVisible();
  await expect(page.getByTestId("history-record-date").filter({ hasText: "年" }).first()).toBeVisible();
  await shot(page, "home");
  await page.getByTestId("toggle-week-insights").first().click();
  await expect(page.getByText("セット範囲の設定を変更")).toBeVisible();
  await expect(page.getByText(/2\d{3}年\d{1,2}月\d{1,2}日〜/)).toBeVisible();
  await shot(page, "week-insights");
  await page.getByTestId("modal-close").and(page.locator(":visible")).click();

  await page.getByTestId("footer-graphs").click();
  await page.getByTestId("dashboard-generate-starter").click();
  await expect(page.getByTestId("dashboard-graph")).toHaveCount(1);
  await expect(page.getByText("7日間のワークアウト数")).toBeVisible();
  await expect(page.getByText(/^6か月で\d+回$/).first()).toBeVisible();
  await expect(page.getByText(/件中\d+件が範囲内/)).toBeVisible();
  await shot(page, "dashboard");

  await page.getByTestId("dashboard-edit").and(page.locator(":visible")).click();
  const graphSlot = page
    .locator('[data-testid^="dashboard-edit-slot-"]')
    .filter({ has: page.getByTestId("dashboard-graph") });
  await graphSlot.getByTestId(/^dashboard-edit-menu-\d+$/).click();
  await page.getByTestId("dashboard-edit-menu-edit").click();
  await expect(page.getByTestId("dashboard-widget-add-series")).toBeVisible();
  await shot(page, "dashboard-graph-form");
  await expect(page.getByText(/ベントオーバーロウ（バーベル）.*推定1RM/).first()).toBeVisible();
  await shot(page, "dashboard-graph-form");
  await page.getByTestId("dashboard-widget-series-0").click();
  await expect(page.getByText(/ごとに1点を描きます。|ごとに1点（その期間の/).first()).toBeVisible();
  await shot(page, "dashboard-series-form");
  await page.getByTestId("dashboard-widget-series-back").click();
  await page.getByTestId("dashboard-widget-cancel").click();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-1rm-formula").click();
  await expect(page.getByText(/5回：\d+%/).first()).toBeVisible();
  await shot(page, "1rm-formula");
  await page.getByTestId("navbar-back").last().click();

  const stored = await readStoredData(page);
  expect(stored.length).toBeGreaterThan(1000);
  expect(JaUtils_withoutProgramTexts(stored).match(JAPANESE)?.[0]).toBeUndefined();

  const missing = (await JaUtils_missing(page)).filter((text) => !ALLOW.some((a) => text === a || text.includes(a)));
  console.log(`MISSING: ${JSON.stringify(missing)}`);
  expect(missing).toEqual([]);
});

test("equipment texts and confirms are Japanese", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await page.locator("button").filter({ hasText: JaUtils_basicProgram }).click();
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-available-equipment").click();
  await shot(page, "equipment");
  await page.getByTestId("group-header-barbell").click();
  await shot(page, "equipment-detail");

  const missing = (await JaUtils_missing(page)).filter((text) => !ALLOW.some((a) => text === a || text.includes(a)));
  expect(missing).toEqual([]);
  expect(dialogs).toEqual([]);
});
