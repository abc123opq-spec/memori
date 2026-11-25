import "mocha";
import { expect } from "chai";
import {
  Translate_text,
  Translate_format,
  Translate_children,
  Translate_missing,
  Translate_setDictionaryForTest,
} from "../src/i18n/translate";
import { Language_resolve } from "../src/i18n/language";

describe("Translate", () => {
  afterEach(() => Translate_setDictionaryForTest({}, "en"));

  it("translates by trimmed text and keeps the surrounding spaces", () => {
    Translate_setDictionaryForTest({ Settings: "設定", "{n} sets": "{n} セット" }, "ja");
    expect(Translate_text("Settings")).to.equal("設定");
    expect(Translate_text("  Settings ")).to.equal("  設定 ");
    expect(Translate_text("Unknown")).to.equal("Unknown");
    expect(Translate_text("constructor")).to.equal("constructor");
    expect(Translate_format("{n} sets", { n: 3 })).to.equal("3 セット");
  });

  it("does not change the children it gets", () => {
    Translate_setDictionaryForTest({ Settings: "設定" }, "ja");
    const input = ["Settings", 3];
    expect(Translate_children(input)).to.deep.equal(["設定", 3]);
    expect(input).to.deep.equal(["Settings", 3]);
  });

  it("returns the original text in English", () => {
    Translate_setDictionaryForTest({ Settings: "設定" }, "en");
    expect(Translate_text("Settings")).to.equal("Settings");
    expect(Translate_format("{n} sets", { n: 3 })).to.equal("3 sets");
  });

  it("collects texts without a translation", () => {
    Translate_setDictionaryForTest({ Settings: "設定" }, "ja");
    Translate_text("Settings");
    Translate_text("Unknown text");
    Translate_text("42");
    expect(Translate_missing()).to.deep.equal(["Unknown text"]);
  });

  it("does not collect values with units or texts that are already Japanese", () => {
    Translate_setDictionaryForTest({ Settings: "設定" }, "ja");
    ["95 lb", "70lb", "(5 x 95 lb)", "12 min", "EZバー", "バーベル、EZバー"].forEach((s) => Translate_text(s));
    expect(Translate_missing()).to.deep.equal([]);
    Translate_text("Bench Press");
    expect(Translate_missing()).to.deep.equal(["Bench Press"]);
  });

  it("prefers the key with the context, and falls back to the plain key", () => {
    Translate_setDictionaryForTest({ Target: "主動筋", "Target@@workout": "目標", "{n} sets": "{n} セット" }, "ja");
    expect(Translate_text("Target", "workout")).to.equal("目標");
    expect(Translate_text("Target", "muscle")).to.equal("主動筋");
    expect(Translate_text("Target")).to.equal("主動筋");
    expect(Translate_children([" Target ", 1], "workout")).to.deep.equal([" 目標 ", 1]);
    expect(Translate_format("{n} sets", { n: 2 }, "workout")).to.equal("2 セット");
    Translate_setDictionaryForTest({ "Target@@workout": "目標" }, "en");
    expect(Translate_text("Target", "workout")).to.equal("Target");
  });

  it("picks the language from the url first, then from the browser", () => {
    expect(Language_resolve("?lang=en", "ja-JP")).to.equal("en");
    expect(Language_resolve("?lang=ja", "en-US")).to.equal("ja");
    expect(Language_resolve("", "ja-JP")).to.equal("ja");
    expect(Language_resolve("?lang=fr", "en-US")).to.equal("en");
  });
});
