import "mocha";
import { expect } from "chai";
import { ja } from "../src/i18n/ja";
import { Translate_setDictionaryForTest, Translate_text } from "../src/i18n/translate";
import { ProgramListMeta_durationLabel } from "../src/models/programListMeta";

describe("ProgramListMeta", () => {
  afterEach(() => Translate_setDictionaryForTest(ja, "en"));

  it("uses the filter label for a known duration", () => {
    expect(ProgramListMeta_durationLabel("30-45")).to.equal("30-45 minutes");
    expect(ProgramListMeta_durationLabel("90+")).to.equal("90+ minutes");
  });

  it("reads as a Japanese range in Japanese", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(Translate_text(ProgramListMeta_durationLabel("30-45"))).to.equal("30〜45分");
    expect(Translate_text(ProgramListMeta_durationLabel("90+"))).to.equal("90分以上");
  });

  it("keeps an unknown duration as minutes", () => {
    expect(ProgramListMeta_durationLabel("20")).to.equal("20 mins");
    Translate_setDictionaryForTest(ja, "ja");
    expect(ProgramListMeta_durationLabel("20")).to.equal("20分");
  });
});
