import * as fs from "fs";
import * as path from "path";
import { Page, expect } from "@playwright/test";
import { startpage } from "../playwrightUtils";

export const JaUtils_basicProgram = /Basic Beginner Routine|ベーシックビギナールーティン/;

function builtinProgramTexts(): Set<string> {
  const file = path.resolve(__dirname, "../../programdata/index.json");
  if (!fs.existsSync(file)) {
    return new Set();
  }
  const index = JSON.parse(fs.readFileSync(file, "utf8")) as {
    name: string;
    shortDescription: string;
    description: string;
  }[];
  return new Set(index.flatMap((p) => [p.name, p.shortDescription, p.description]));
}

const programTexts = builtinProgramTexts();

export function JaUtils_withoutProgramTexts(text: string): string {
  return Array.from(programTexts).reduce((memo, t) => memo.split(t).join(""), text);
}

export async function JaUtils_open(page: Page): Promise<void> {
  await page.goto(`${startpage}?skipintro=1&lang=ja`);
}

export async function JaUtils_missing(page: Page): Promise<string[]> {
  const all = await page.evaluate(() => (window as unknown as { __i18nMissing?: string[] }).__i18nMissing ?? []);
  return all.filter((text) => !programTexts.has(text));
}

export async function JaUtils_expectNoMissing(page: Page, allow: string[]): Promise<void> {
  const missing = (await JaUtils_missing(page)).filter((text) => !allow.some((a) => text === a || text.includes(a)));
  expect(missing).toEqual([]);
}
