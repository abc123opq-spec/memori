import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Glossary_terms, Glossary_findViolations, Glossary_headings, Glossary_style } from "../src/i18n/ja/glossary";

function readTexts(dir: string, ext: string, skip: string[] = []): { file: string; text: string }[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !skip.includes(f))
    .map((f) => ({ file: path.join(dir, f), text: fs.readFileSync(path.join(dir, f), "utf8") }));
}

describe("Glossary", () => {
  it("flags a banned variant", () => {
    expect(Glossary_findViolations("エクササイズを追加")).to.deep.equal([{ term: "Exercise", found: "エクササイズ" }]);
  });

  it("does not flag a banned word that is part of a longer katakana word", () => {
    for (const text of ["ジャガーノート", "アドバイス", "フローチャート", "レバレッジマシンではなく"]) {
      const found = Glossary_findViolations(text).filter((v) => v.found !== "レバレッジマシン");
      expect(found, text).to.deep.equal([]);
    }
    expect(Glossary_findViolations("ノートを開く")).to.deep.equal([{ term: "Notes", found: "ノート" }]);
    expect(Glossary_findViolations("チャートを見る")).to.deep.equal([{ term: "Graph", found: "チャート" }]);
    expect(Glossary_findViolations("回外グリップ")).to.deep.equal([{ term: "Supinated grip", found: "回外グリップ" }]);
  });

  it("flags the kanji spellings decided in review, not the hiragana ones", () => {
    expect(Glossary_findViolations("肘を曲げる")).to.deep.equal([{ term: "Elbow", found: "肘" }]);
    expect(Glossary_findViolations("膝を伸ばす")).to.deep.equal([{ term: "Knee", found: "膝" }]);
    expect(Glossary_findViolations("臀筋を使う")).to.deep.equal([{ term: "Glutes", found: "臀" }]);
    expect(Glossary_findViolations("ひじとひざ、ひざまずく、ケガ、わかる、繰り返す、殿筋群")).to.deep.equal([]);
    expect(Glossary_findViolations("膝蓋腱炎、膝蓋骨、膝蓋腱")).to.deep.equal([]);
    expect(Glossary_findViolations("膝蓋骨と膝を曲げる")).to.deep.equal([{ term: "Knee", found: "膝" }]);
  });

  it("has a unique heading table with no banned wording", () => {
    const keys = Glossary_headings.map((h) => h.en);
    expect(new Set(keys).size).to.equal(keys.length);
    expect(Glossary_headings.flatMap((h) => Glossary_findViolations(h.ja))).to.deep.equal([]);
  });

  it("passes the preferred wording", () => {
    expect(Glossary_findViolations("種目を追加。3セット×5回、ウォームアップ、ディロード")).to.deep.equal([]);
  });

  it("ignores code blocks and inline code", () => {
    expect(Glossary_findViolations("```\nエクササイズ\n```\n`プログレス`")).to.deep.equal([]);
  });

  it("has no avoid string that appears inside a preferred term", () => {
    const preferred = Glossary_terms.map((t) => t.ja);
    const bad: string[] = [];
    for (const term of Glossary_terms) {
      for (const a of term.avoid) {
        const hit = preferred.find((p) => p.includes(a));
        if (hit) {
          bad.push(`${term.en}: ${a} in ${hit}`);
        }
      }
    }
    expect(bad).to.deep.equal([]);
  });

  it("has unique English keys, and style rules", () => {
    const keys = Glossary_terms.map((t) => t.en);
    expect(new Set(keys).size).to.equal(keys.length);
    expect(Glossary_style.length).to.be.greaterThan(0);
  });

  it("finds no banned variants in the Japanese files", () => {
    const files = [
      ...readTexts("src/i18n/ja", ".ts", ["glossary.ts"]),
      ...readTexts("exercises/ja", ".md"),
      ...readTexts("programs/builtin-ja", ".md"),
    ];
    const found = files.flatMap((f) => Glossary_findViolations(f.text).map((v) => `${f.file}: ${v.term} ${v.found}`));
    expect(found).to.deep.equal([]);
  });

  it("writes weights in kg in program prose", () => {
    const found = readTexts("programs/builtin-ja", ".md").flatMap((f) =>
      f.text
        .replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, "")
        .split("\n")
        .filter((line) => !line.startsWith(":::") && /\d\s?lbs?(?![A-Za-z])|ポンド/.test(line))
        .map((line) => `${f.file}: ${line.trim().slice(0, 80)}`)
    );
    expect(found).to.deep.equal([]);
  });
});
