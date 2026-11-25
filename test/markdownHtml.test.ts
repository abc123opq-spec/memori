import "mocha";
import { expect } from "chai";
import { MarkdownHtml_directives, MarkdownHtml_render } from "../src/utils/markdownHtml";

describe("MarkdownHtml_render", () => {
  it("escapes raw HTML when HTML is disabled, and keeps it otherwise", () => {
    const value = 'Hi <img src=x onerror="alert(1)"> **bold**';
    expect(MarkdownHtml_render(value, true)).to.equal(
      "<p>Hi &lt;img src=x onerror=&quot;alert(1)&quot;&gt; <strong>bold</strong></p>\n"
    );
    expect(MarkdownHtml_render(value, false)).to.contain("<img src=x");
  });

  it("closes emphasis next to Japanese text after punctuation", () => {
    expect(MarkdownHtml_render("2〜3RMの**85〜100%**ほど", false)).to.equal(
      "<p>2〜3RMの<strong>85〜100%</strong>ほど</p>\n"
    );
    expect(MarkdownHtml_render("- **レップマックス（RM）**：説明", false)).to.equal(
      "<ul>\n<li><strong>レップマックス（RM）</strong>：説明</li>\n</ul>\n"
    );
    expect(MarkdownHtml_render("これは**「スクワット」**です", true)).to.equal(
      "<p>これは<strong>「スクワット」</strong>です</p>\n"
    );
    expect(MarkdownHtml_render("**1回も落としません。**1つもです", true)).to.equal(
      "<p><strong>1回も落としません。</strong>1つもです</p>\n"
    );
    expect(MarkdownHtml_render("重さは*5%*ずつ", true)).to.equal("<p>重さは<em>5%</em>ずつ</p>\n");
    expect(MarkdownHtml_render("A **85%**ほど、B **1〜3回**で", true)).to.equal(
      "<p>A <strong>85%</strong>ほど、B <strong>1〜3回</strong>で</p>\n"
    );
  });

  it("keeps English emphasis rules unchanged", () => {
    expect(MarkdownHtml_render("a **b** c *d* e", true)).to.equal("<p>a <strong>b</strong> c <em>d</em> e</p>\n");
    expect(MarkdownHtml_render("**85%**of", true)).to.equal("<p>**85%**of</p>\n");
    expect(MarkdownHtml_render("snake_case_word and 2 * 3 * 4", true)).to.equal(
      "<p>snake_case_word and 2 * 3 * 4</p>\n"
    );
    expect(MarkdownHtml_render("foo**bar**baz", true)).to.equal("<p>foo<strong>bar</strong>baz</p>\n");
  });
});

describe("MarkdownHtml_directives", () => {
  it("escapes exercise names and example attributes before they become HTML", () => {
    const out = MarkdownHtml_directives('[{Squat"><img src=x onerror=alert(1)>}]', {
      exercise: true,
      exerciseExample: false,
    });
    expect(out).to.not.contain("<img");
    expect(out).to.contain("&lt;img");
    const example = MarkdownHtml_directives(':::exercise-example{exercise="squat" weekLabels="a&quot;b"}', {
      exercise: false,
      exerciseExample: true,
    });
    expect(example).to.contain('data-exercise="squat"');
    expect(example).to.contain('data-week-labels="a&amp;quot;b"');
  });

  it("leaves text alone without directives", () => {
    expect(MarkdownHtml_directives("[{Squat}]", { exercise: false, exerciseExample: false })).to.equal("[{Squat}]");
  });
});
