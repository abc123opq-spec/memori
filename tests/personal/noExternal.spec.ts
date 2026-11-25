import { test, expect } from "@playwright/test";
import { JaUtils_basicProgram } from "./jaUtils";
import {
  startpage,
  PlaywrightUtils_disableSubscriptions,
  PlaywrightUtils_disableTours,
  PlaywrightUtils_selectBuiltin,
} from "../playwrightUtils";

const base = process.env.PERSONAL_BASE_URL ?? "http://localhost:8080/";

test("makes no request outside localhost and no CSP violation", async ({ page, context }) => {
  const requests: string[] = [];
  const cspErrors: string[] = [];
  const pageErrors: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      cspErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(startpage + "?skipintro=1");
  await PlaywrightUtils_disableTours(page);
  await PlaywrightUtils_selectBuiltin(page);
  await expect(page.getByRole("button", { name: JaUtils_basicProgram })).toBeVisible();
  await page.getByRole("button", { name: JaUtils_basicProgram }).click();
  await PlaywrightUtils_disableSubscriptions(page);
  await page.getByTestId("clone-program").click();

  await page.getByTestId("footer-workout").click();
  await page.getByTestId("bottom-sheet").getByTestId("start-workout").click();
  await page.getByTestId("complete-set").first().click();
  await expect(page.getByTestId("complete-set").first()).toBeVisible();

  await page.getByTestId("footer-graphs").click();
  await page.waitForTimeout(500);

  await page.getByTestId("footer-me").click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByTestId("menu-item-import-data-from-json-file").click();
  (await chooser).setFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"broken":') });
  await page.waitForTimeout(1000);

  const outside = requests.filter((u) => !u.startsWith(base) && !u.startsWith("data:") && !u.startsWith("blob:"));
  expect(outside).toEqual([]);
  expect(cspErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
