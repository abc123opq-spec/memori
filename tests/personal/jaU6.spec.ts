import { test, expect, Locator, Page } from "@playwright/test";
import {
  PlaywrightUtils_clearCodeMirror,
  PlaywrightUtils_createProgram,
  PlaywrightUtils_disableTours,
  PlaywrightUtils_typeCodeMirror,
} from "../playwrightUtils";
import { JaUtils_open, JaUtils_missing } from "./jaUtils";

const scheme = process.env.SHOT_SCHEME === "dark" ? "dark" : "light";
test.use({ locale: "ja-JP", viewport: { width: 375, height: 812 }, colorScheme: scheme });

const userText = [
  "Liftosaur",
  "Liftoscript",
  "kg",
  "lb",
  "cm",
  "in",
  "My Program",
  "My Exercise",
  "Boom",
  "Bench Press",
  "EZ",
  "Top",
  "Middle",
  "Low",
];
const shots = ".work/developer-u6";

async function missingSince(page: Page, before: string[]): Promise<string[]> {
  const known = new Set(before);
  const now = await JaUtils_missing(page);
  return now.filter((m) => !known.has(m) && !userText.some((a) => m === a || m.includes(a)));
}

async function openProgramEditor(page: Page): Promise<void> {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-ui-program").click();
}

async function openPicker(page: Page): Promise<void> {
  await openProgramEditor(page);
  await page.getByTestId("add-exercise").click();
  await expect(page.getByTestId("exercise-filter-by-name")).toBeVisible();
}

function filterButton(page: Page): Locator {
  return page.getByTestId("exercise-filter-by-name").locator("xpath=../following-sibling::*[1]");
}

test("exercise picker, filter and sort are Japanese", async ({ page }) => {
  await openPicker(page);
  const before = await JaUtils_missing(page);
  const search = page.getByTestId("exercise-filter-by-name");
  await expect(search).toHaveAttribute("placeholder", "種目を検索");
  await expect(page.getByText("並べ替え：")).toBeVisible();
  await expect(page.getByText("種目を追加").first()).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-picker-top.png` });

  await page.getByTestId("tab-template").click();
  await expect(page.getByText("テンプレート名")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-picker-template.png` });
  await page.getByTestId("tab-exercise").click();

  await filterButton(page).click();
  await expect(page.getByText("絞り込みと並べ替え")).toBeVisible();
  for (const name of ["並べ替え：", "器具：", "種類：", "筋肉："]) {
    await page.getByText(name, { exact: false }).first().click();
  }
  await page.screenshot({ path: `${shots}/${scheme}-picker-filter.png` });
  await page.getByText("プッシュ", { exact: true }).first().click();
  await page.getByText("バーベル", { exact: true }).first().click();
  await expect(page.getByText("種類：").first()).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-picker-filter-selected.png` });
  await page.getByText("筋肉", { exact: true }).last().click();
  await page.screenshot({ path: `${shots}/${scheme}-picker-filter-muscles.png` });
  await page.getByTestId("navbar-back").and(page.locator(":visible")).click();
  await expect(page.getByText("、絞り込み：")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-picker-filtered.png` });
  await page.getByTestId("clear-filters").click();

  expect(await missingSince(page, before)).toEqual([]);
});

test("custom exercise form is Japanese", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await openPicker(page);
  const before = await JaUtils_missing(page);
  await page.getByTestId("custom-exercise-create").first().click();
  await expect(page.getByText("自作種目を編集")).toBeVisible();
  await page.screenshot({ path: `${shots}/${scheme}-custom-exercise.png` });
  await page.getByTestId("custom-exercise-name-input").fill("My Exercise");
  await page.getByTestId("select-target-muscles").click();
  await page.screenshot({ path: `${shots}/${scheme}-custom-exercise-muscles.png` });
  expect(await missingSince(page, before)).toEqual([]);
});

test("equipment editor is Japanese for every setup type", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-available-equipment").click();
  await page.getByText("新しい器具", { exact: false }).first().click();
  await page.getByTestId("equipment-name-input").fill("Boom");
  await page.getByTestId("add-equipment-submit").click();
  await expect(page.locator(`[data-testid="equipment-editor"]:visible`)).toHaveCount(1);
  const before = await JaUtils_missing(page);

  const types: [string, string][] = [
    ["プレート", "plates"],
    ["重量スタック", "stack"],
    ["固定重量", "fixed"],
    ["電動", "electric"],
    ["バンド", "bands"],
  ];
  for (const [label, type] of types) {
    await page.locator(`[data-testid="menu-item-value-type"]:visible`).selectOption({ label });
    await page.waitForTimeout(400);
    const adds = page.locator(`[data-testid^="equipment-add-"]:visible`);
    for (let i = 0; i < 6 && (await adds.count()) > 0; i += 1) {
      await adds.first().click();
      await page.waitForTimeout(250);
    }
    await page.screenshot({ path: `${shots}/${scheme}-equipment-${type}.png`, fullPage: true });
  }
  expect(await missingSince(page, before)).toEqual([]);
});

test("no tour starts on a new program or a first workout", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-full-program").click();
  await PlaywrightUtils_clearCodeMirror(page, "planner-editor");
  await PlaywrightUtils_typeCodeMirror(page, "planner-editor", "# Week 1\n## Day 1\nSquat / 3x8 / 100lb");
  await page.getByTestId("save-program").click();
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId("tour-next")).toHaveCount(0);
});

async function openHelp(page: Page): Promise<void> {
  const handle = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("svg"))
      .map((svg) => svg.closest("div.p-2"))
      .filter((el): el is Element => el != null)
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.top < 60);
    buttons.sort((a, b) => b.rect.left - a.rect.left);
    return buttons[0]?.el ?? null;
  });
  await handle.asElement()?.click();
}

async function closeHelp(page: Page): Promise<void> {
  await page.getByTestId("modal-close").and(page.locator(":visible")).click();
}

const helpScreens: [string, string, string][] = [
  ["settings", "", "マイページ"],
  ["measurements", "menu-item-measurements", "計測"],
  ["exercises", "menu-item-exercises", "種目"],
  ["timers", "menu-item-timers", "休憩タイマー"],
  ["equipment", "menu-item-available-equipment", "器具"],
];

test("help modals are Japanese", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await page.getByTestId("footer-me").click();
  const before = await JaUtils_missing(page);
  for (const [name, menuItem] of helpScreens) {
    if (menuItem !== "") {
      await page.getByTestId("footer-me").click();
      await page.getByTestId(menuItem).click();
    }
    await openHelp(page);
    await expect(page.getByTestId("modal-close").and(page.locator(":visible"))).toBeVisible();
    await page.screenshot({ path: `${shots}/${scheme}-help-${name}.png` });
    await closeHelp(page);
    if (menuItem !== "") {
      await page.locator(`[data-testid="navbar-back"]:visible`).click();
    }
  }
  expect(await missingSince(page, before)).toEqual([]);
});

const exerciseRows = `[data-testid^="custom-exercise-"]:not([data-testid^="custom-exercise-edit-"]):not([data-testid="custom-exercise-create"])`;

test("every exercise name in the picker list is Japanese", async ({ page }) => {
  await openPicker(page);
  await expect(page.locator(exerciseRows).first()).toBeVisible();
  const names = new Set<string>();
  const collect = async (): Promise<void> => {
    const found = await page.evaluate(
      (selector) =>
        Array.from(document.querySelectorAll(selector)).map(
          (el) => (el.previousElementSibling as HTMLElement | null)?.innerText ?? ""
        ),
      exerciseRows
    );
    found.forEach((n) => names.add(n));
  };
  const scrollTop = (): Promise<number> =>
    page.evaluate((selector) => {
      let el: HTMLElement | null = document.querySelector(selector) as HTMLElement | null;
      while (
        el != null &&
        !(el.scrollHeight > el.clientHeight + 50 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))
      ) {
        el = el.parentElement;
      }
      return el == null ? -1 : el.scrollTop;
    }, exerciseRows);
  await expect.poll(scrollTop, { timeout: 10000 }).toBeGreaterThanOrEqual(0);
  await page.mouse.move(187, 500);
  let last = -1;
  let stuck = 0;
  const positions: number[] = [];
  for (let i = 0; i < 200 && stuck < 3; i += 1) {
    await collect();
    const top = await scrollTop();
    positions.push(top);
    stuck = top === last ? stuck + 1 : 0;
    last = top;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(150);
  }
  const middle = positions[Math.floor(positions.length / 2)];
  expect(last).toBeGreaterThan(1000);
  await page.screenshot({ path: `${shots}/${scheme}-picker-list-bottom.png` });
  await page.mouse.wheel(0, middle - last);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/${scheme}-picker-list-middle.png` });
  await page.mouse.wheel(0, -middle - 2000);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/${scheme}-picker-list-top.png` });
  const english = Array.from(names).filter((n) => n !== "" && !/[ぁ-んァ-ヶ一-龠]/.test(n));
  console.log(`names seen: ${names.size}, end ${last}, middle ${middle}`);
  expect(english).toEqual([]);
});
