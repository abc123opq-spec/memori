import { test, expect, Page, BrowserContext } from "@playwright/test";
import { JaUtils_open } from "./jaUtils";
import {
  PlaywrightUtils_createProgram,
  PlaywrightUtils_disableSubscriptions,
  PlaywrightUtils_disableTours,
  PlaywrightUtils_selectBuiltin,
} from "../playwrightUtils";

const base = process.env.PERSONAL_BASE_URL ?? "http://localhost:8080/";

test.use({ locale: "ja-JP" });

function collectOutside(context: BrowserContext): string[] {
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  return requests;
}

function outsideOf(requests: string[]): string[] {
  return requests.filter((u) => !u.startsWith(base) && !u.startsWith("data:") && !u.startsWith("blob:"));
}

const gzclp = "GZCLP";
const basicBeginner = "ベーシックビギナールーティン";

async function openBuiltinInfo(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder("名前で検索").fill(name);
  await page.getByRole("button", { name, exact: true }).click();
}

async function openGzclpGuide(page: Page): Promise<void> {
  await PlaywrightUtils_selectBuiltin(page);
  await openBuiltinInfo(page, gzclp);
  await page.getByTestId("program-guide-open").click();
  await expect(page.getByTestId("program-guide")).toBeVisible();
}

async function startGzclpAndOpenBentOverRow(page: Page): Promise<void> {
  await openBuiltinInfo(page, gzclp);
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("clone-program").click();
  await page.getByTestId("continue-1rms").click();
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-exercises").click();
  await page.getByText("ベントオーバーロウ", { exact: true }).first().click();
  await expect(page.getByTestId("exercise-stats-image")).toBeAttached();
}

test("program guide opens from the info modal with the body, FAQ and no author-site link", async ({
  page,
  context,
}) => {
  const requests = collectOutside(context);
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);

  await openBuiltinInfo(page, gzclp);
  await expect(page.getByText("GZCLPを始める")).toBeVisible();
  await expect(page.getByText("公式サイト")).toHaveCount(0);
  await expect(page.locator("text=liftosaur.com")).toHaveCount(0);
  await page.getByTestId("program-guide-open").click();
  const guide = page.getByTestId("program-guide");
  await expect(guide).toBeVisible();
  await expect(guide.locator("h2", { hasText: /^GZCLの原則$/ })).toBeVisible();
  await expect(page.getByTestId("program-guide-faq")).toBeVisible();
  await page.getByTestId("guide-close").click();

  await openBuiltinInfo(page, basicBeginner);
  await expect(page.getByText("公式サイト")).toBeVisible();
  expect(outsideOf(requests)).toEqual([]);
});

test("exercise names in the program guide become tooltips", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await openGzclpGuide(page);
  const directive = page.getByTestId("program-guide").locator(".md-exercise-directive").first();
  await expect(directive.locator(".md-exercise-name")).toBeVisible();
  await expect(directive).toContainText("スクワット");
});

test("a link to another program switches the guide in place and one close returns to the list", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await openGzclpGuide(page);
  await page.getByTestId("program-guide").locator("a", { hasText: "ベーシックビギナールーティン" }).first().click();
  await expect(page.getByTestId("program-guide-title")).toHaveText("ベーシックビギナールーティン");
  await expect(page.getByTestId("program-guide")).toHaveCount(1);
  await page.getByTestId("guide-close").click();
  await expect(page.getByTestId("program-guide")).toHaveCount(0);
  await expect(page.getByTestId("modal")).toHaveCount(0);
  await expect(page.getByRole("button", { name: gzclp, exact: true })).toBeVisible();
});

test("exercise guide opens from exercise stats with numbered steps", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await startGzclpAndOpenBentOverRow(page);
  await page.getByTestId("exercise-guide-open").click();
  const guide = page.getByTestId("exercise-guide");
  await expect(guide).toBeVisible();
  await expect(guide.locator("ol").first()).toBeVisible();
  await page.getByTestId("guide-close").click();
  await expect(guide).toHaveCount(0);
});

test("a custom exercise has no guide entry", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-ui-program").click();
  await page.getByTestId("add-exercise").click();
  await page.getByTestId("custom-exercise-create").click();
  await page.getByTestId("custom-exercise-name-input").fill("My Exercise");
  await page.getByTestId("custom-exercise-create").click();
  await page.getByTestId("menu-item-my-exercise").click();
  await page.getByTestId("exercise-picker-confirm").click();
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-exercises").click();
  await page.getByText("My Exercise", { exact: true }).first().click();
  await expect(page.getByTestId("exercise-stats-image")).toBeAttached();
  await expect(page.getByTestId("exercise-guide-open")).toHaveCount(0);
});

test("both guides open offline after the service worker is ready", async ({ page, context }) => {
  page.on("dialog", (dialog) => dialog.accept());
  const requests = collectOutside(context);
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(5000);
  await page.reload();
  await PlaywrightUtils_disableTours(page);
  await context.setOffline(true);

  await openGzclpGuide(page);
  await expect(page.getByTestId("program-guide-faq")).toBeVisible();
  await page.getByTestId("guide-close").click();

  await startGzclpAndOpenBentOverRow(page);
  await page.getByTestId("exercise-guide-open").click();
  await expect(page.getByTestId("exercise-guide").locator("ol").first()).toBeVisible();
  await context.setOffline(false);
  expect(outsideOf(requests)).toEqual([]);
});

async function cloneGzclp(page: Page): Promise<void> {
  await PlaywrightUtils_selectBuiltin(page);
  await openBuiltinInfo(page, gzclp);
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("clone-program").click();
  await page.getByTestId("continue-1rms").click();
}

test("the program preview opens the guide and has no author-site link", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await openBuiltinInfo(page, gzclp);
  await page.getByTestId("preview-program").click();
  await expect(page.getByTestId("program-name")).toHaveText(gzclp);
  await expect(page.getByText("公式サイト")).toHaveCount(0);
  await expect(page.locator('a[href*="liftosaur.com"]')).toHaveCount(0);
  await page.getByTestId("program-preview-guide-open").click();
  await expect(page.getByTestId("program-guide-title")).toHaveText(gzclp);
});

test("a cloned and renamed built-in program opens its guide from the program tab and the program list", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await cloneGzclp(page);

  await page.getByTestId("footer-program").click();
  const nameInput = page.locator("textarea").first();
  await nameInput.fill("私のGZCLP");
  await nameInput.blur();
  await page.getByTestId("program-screen-guide-open").click();
  await expect(page.getByTestId("program-guide-title")).toHaveText(gzclp);
  await page.getByTestId("guide-close").click();

  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-program").click();
  await expect(page.getByTestId("program-list-choose-program").getByText("私のGZCLP")).toBeVisible();
  await page.locator('[data-testid^="program-list-guide-open-"]').first().click();
  await expect(page.getByTestId("program-guide-title")).toHaveText(gzclp);
});

test("a custom program has no guide entry on the program tab or in the program list", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("footer-program").click();
  await expect(page.getByTestId("change-program")).toBeVisible();
  await expect(page.getByTestId("program-screen-guide-open")).toHaveCount(0);
  await page.getByTestId("footer-me").click();
  await page.getByTestId("menu-item-program").click();
  await expect(page.getByTestId("program-list-choose-program").getByText("My Program")).toBeVisible();
  await expect(page.locator('[data-testid^="program-list-guide-open-"]')).toHaveCount(0);
});

test("the exercise picker opens a guide without choosing the exercise", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await cloneGzclp(page);
  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-empty-workout").click();
  await page.getByTestId("exercise-filter-by-name").fill("Bench Press");
  await page.getByTestId("exercise-picker-guide-benchpress_barbell").click();
  await expect(page.getByTestId("exercise-guide")).toBeVisible();
  await page.getByTestId("guide-close").click();
  await expect(page.getByTestId("exercise-guide")).toHaveCount(0);
  await expect(page.getByTestId("exercise-picker-confirm")).toBeVisible();
  await expect(page.getByTestId("menu-item-bench-press-barbell")).not.toHaveClass(/bg-background-purpledark/);
  await page.getByTestId("exercise-picker-confirm").click();
  await expect(page.getByTestId("exercise-picker-confirm")).toHaveCount(0);
  await expect(page.getByTestId("entry-bench-press")).toHaveCount(0);
});

test("a custom exercise has no guide button in the exercise picker", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_createProgram(page, "My Program");
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("tab-edit").click();
  await page.getByTestId("editor-v2-ui-program").click();
  await page.getByTestId("add-exercise").click();
  await page.getByTestId("custom-exercise-create").click();
  await page.getByTestId("custom-exercise-name-input").fill("My Exercise");
  await page.getByTestId("custom-exercise-create").click();
  await expect(page.locator('[data-testid^="exercise-picker-guide-"]').first()).toBeVisible();
  const customRow = page
    .getByTestId("custom-exercise-edit-my-exercise")
    .locator('xpath=ancestor::*[starts-with(@data-testid, "menu-item-")][1]');
  await expect(customRow).toBeVisible();
  await expect(customRow.locator('[data-testid^="exercise-picker-guide-"]')).toHaveCount(0);
});

test("bold next to Japanese text renders as bold in the GZCLP guide", async ({ page }) => {
  await JaUtils_open(page);
  await PlaywrightUtils_disableTours(page);
  await openGzclpGuide(page);
  const guide = page.getByTestId("program-guide");
  await expect(guide.locator("strong", { hasText: "85〜100%" }).first()).toBeVisible();
  expect(await guide.innerText()).not.toContain("**");
});
