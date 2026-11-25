import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  MarkdownOverlay_check,
  MarkdownOverlay_dir,
  MarkdownOverlay_orphans,
  MarkdownOverlay_pick,
  MarkdownOverlay_read,
} from "../src/utils/markdownOverlay";

const program = [
  "---",
  "id: p1",
  'name: "Name"',
  "author: A",
  "url: https://example.com",
  'shortDescription: "Short"',
  "isMultiweek: true",
  "tags: []",
  "frequency: 3",
  'age: "less_than_3_months"',
  'duration: "30-45"',
  'goal: "strength"',
  "---",
  "",
  "Intro",
  "",
  "<!-- more -->",
  "",
  "Long",
  "",
  "<!-- faq -->",
  "",
  "Q",
  "",
  "```liftoscript",
  "# Week 1",
  "## Day 1",
  "Squat / 3x5 100lb",
  "```",
  "",
].join("\n");

const exercise = [
  "---",
  'video: "abc"',
  'description: "Desc"',
  "---",
  "",
  "Body",
  "",
  "<!-- howto -->",
  "",
  "### Step one",
  "Do it.",
  "### Step two",
  "Do more.",
  "",
].join("\n");

describe("MarkdownOverlay_check", () => {
  it("accepts a translation of the visible text", () => {
    const ja = program
      .replace('name: "Name"', 'name: "名前"')
      .replace('shortDescription: "Short"', 'shortDescription: "短い説明"')
      .replace("Intro", "はじめに")
      .replace("Long", "詳しく")
      .replace("Q", "質問");
    expect(MarkdownOverlay_check("program", program, ja)).to.deep.equal([]);
  });

  it("flags one changed character in the liftoscript block", () => {
    const ja = program.replace("100lb", "100kg");
    expect(MarkdownOverlay_check("program", program, ja)).to.have.length(1);
  });

  it("flags a changed protected frontmatter key", () => {
    for (const [from, to] of [
      ["id: p1", "id: p2"],
      ["author: A", "author: B"],
      ["isMultiweek: true", "isMultiweek: false"],
      ["tags: []", "tags: [x]"],
      ["frequency: 3", "frequency: 4"],
      ['goal: "strength"', 'goal: "other"'],
    ]) {
      expect(MarkdownOverlay_check("program", program, program.replace(from, to)), from).to.have.length(1);
    }
  });

  it("flags a missing or reordered marker", () => {
    expect(MarkdownOverlay_check("program", program, program.replace("<!-- faq -->", ""))).to.have.length(1);
    const swapped = program
      .replace("<!-- more -->", "<!-- TMP -->")
      .replace("<!-- faq -->", "<!-- more -->")
      .replace("<!-- TMP -->", "<!-- faq -->");
    expect(MarkdownOverlay_check("program", program, swapped)).to.have.length(1);
  });

  it("ignores CRLF in either side", () => {
    expect(MarkdownOverlay_check("program", program.replace(/\n/g, "\r\n"), program)).to.deep.equal([]);
    expect(MarkdownOverlay_check("exercise", exercise, exercise.replace(/\n/g, "\r\n"))).to.deep.equal([]);
  });

  it("exercise: description may change, video may not", () => {
    expect(MarkdownOverlay_check("exercise", exercise, exercise.replace("Desc", "説明"))).to.deep.equal([]);
    expect(MarkdownOverlay_check("exercise", exercise, exercise.replace('"abc"', '"xyz"'))).to.have.length(1);
  });

  it("exercise: flags a different number of ### steps or a missing howto", () => {
    expect(MarkdownOverlay_check("exercise", exercise, exercise.replace("### Step two", "Step two"))).to.have.length(1);
    expect(MarkdownOverlay_check("exercise", exercise, exercise.replace("<!-- howto -->", ""))).to.have.length(2);
  });

  it("flags a changed code block in an exercise", () => {
    const en = `${exercise}\n\`\`\`\nA\n\`\`\`\n`;
    expect(MarkdownOverlay_check("exercise", en, en.replace("A", "B"))).to.have.length(1);
    expect(MarkdownOverlay_check("exercise", en, exercise)).to.have.length(1);
  });
});

describe("MarkdownOverlay_pick and read", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mdoverlay-"));
  const enDir = path.join(root, "en");
  const jaDir = path.join(root, "ja");
  fs.mkdirSync(enDir);
  fs.mkdirSync(jaDir);
  fs.writeFileSync(path.join(enDir, "a.md"), exercise);
  fs.writeFileSync(path.join(enDir, "b.md"), exercise);
  fs.writeFileSync(path.join(jaDir, "a.md"), exercise.replace("Desc", "説明").replace(/\n/g, "\r\n"));
  fs.writeFileSync(path.join(jaDir, "c.md"), exercise);

  after(() => fs.rmSync(root, { recursive: true, force: true }));

  it("prefers the ja file", () => {
    expect(MarkdownOverlay_pick(path.join(enDir, "a.md"), jaDir)).to.equal(path.join(jaDir, "a.md"));
    expect(MarkdownOverlay_pick(path.join(enDir, "b.md"), jaDir)).to.equal(path.join(enDir, "b.md"));
    expect(MarkdownOverlay_pick(path.join(enDir, "b.md"), path.join(root, "none"))).to.equal(path.join(enDir, "b.md"));
  });

  it("turns the overlay off when the language is en", () => {
    expect(MarkdownOverlay_dir(jaDir, undefined)).to.equal(jaDir);
    expect(MarkdownOverlay_dir(jaDir, "ja")).to.equal(jaDir);
    const off = MarkdownOverlay_dir(jaDir, "en");
    expect(MarkdownOverlay_pick(path.join(enDir, "a.md"), off)).to.equal(path.join(enDir, "a.md"));
    expect(MarkdownOverlay_orphans(enDir, off)).to.deep.equal([]);
  });

  it("reads ja with LF and no errors, en without checking", () => {
    const ja = MarkdownOverlay_read(path.join(enDir, "a.md"), jaDir, "exercise");
    expect(ja.errors).to.deep.equal([]);
    expect(ja.raw).to.include("説明").and.not.include("\r");
    expect(MarkdownOverlay_read(path.join(enDir, "b.md"), jaDir, "exercise").errors).to.deep.equal([]);
  });

  it("lists ja files with no en counterpart", () => {
    expect(MarkdownOverlay_orphans(enDir, jaDir)).to.deep.equal(["c.md"]);
    expect(MarkdownOverlay_orphans(enDir, path.join(root, "none"))).to.deep.equal([]);
  });
});
