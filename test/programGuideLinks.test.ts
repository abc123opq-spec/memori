import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  ProgramGuideLinks_rewrite,
  ProgramGuideLinks_programId,
  ProgramGuideLinks_externalUrl,
} from "../src/models/programGuideLinks";

const ids = ["gzclp", "ss1", "basicBeginner"];

describe("ProgramGuideLinks", () => {
  it("rewrites relative and liftosaur.com program links", () => {
    expect(ProgramGuideLinks_rewrite("[x](/programs/gzclp)", ids)).to.equal("[x](#program-guide:gzclp)");
    expect(ProgramGuideLinks_rewrite("[x](https://www.liftosaur.com/programs/gzclp)", ids)).to.equal(
      "[x](#program-guide:gzclp)"
    );
    expect(ProgramGuideLinks_rewrite("[x](https://liftosaur.com/programs/gzclp)", ids)).to.equal(
      "[x](#program-guide:gzclp)"
    );
  });

  it("keeps only the text for unknown ids and other liftosaur.com pages", () => {
    expect(ProgramGuideLinks_rewrite("a [x](/programs/nope) b", ids)).to.equal("a x b");
    expect(ProgramGuideLinks_rewrite("[y](https://www.liftosaur.com/blog/foo)", ids)).to.equal("y");
  });

  it("leaves external links alone", () => {
    const md = "[r](https://www.reddit.com/u/gzcl) [w](https://thefitness.wiki/routines/x/)";
    expect(ProgramGuideLinks_rewrite(md, ids)).to.equal(md);
  });

  it("handles several links in one line and in table rows", () => {
    expect(ProgramGuideLinks_rewrite("[a](/programs/ss1) と [b](/programs/gzclp)", ids)).to.equal(
      "[a](#program-guide:ss1) と [b](#program-guide:gzclp)"
    );
    expect(ProgramGuideLinks_rewrite("| [a](/programs/ss1) | 3 |\n| [b](/programs/zzz) | 4 |", ids)).to.equal(
      "| [a](#program-guide:ss1) | 3 |\n| b | 4 |"
    );
  });

  it("extracts the program id", () => {
    expect(ProgramGuideLinks_programId("#program-guide:ss1")).to.equal("ss1");
    expect(ProgramGuideLinks_programId("https://x")).to.equal(undefined);
  });

  it("drops liftosaur.com urls only", () => {
    expect(ProgramGuideLinks_externalUrl("https://www.liftosaur.com/programs/gzclp")).to.equal(undefined);
    expect(ProgramGuideLinks_externalUrl("https://liftosaur.com/programs/gzclp")).to.equal(undefined);
    expect(ProgramGuideLinks_externalUrl("")).to.equal(undefined);
    expect(ProgramGuideLinks_externalUrl("https://thefitness.wiki/routines/x/")).to.equal(
      "https://thefitness.wiki/routines/x/"
    );
  });

  const dir = path.resolve(__dirname, "../programdata");
  const built = fs.existsSync(path.join(dir, "index.json"));
  (built ? it : it.skip)("leaves no /programs/ link in the built program data", () => {
    const known: string[] = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8")).map(
      (e: { id: string }) => e.id
    );
    const bad: string[] = [];
    let rewritten = 0;
    for (const id of known) {
      const detail = JSON.parse(fs.readFileSync(path.join(dir, "programs/builtin", `${id}.json`), "utf8"));
      for (const text of [detail.fullDescription || "", detail.faq || ""]) {
        const out = ProgramGuideLinks_rewrite(text, known);
        rewritten += (out.match(/#program-guide:/g) || []).length;
        if (/\]\(\/programs\/|liftosaur\.com\/programs/.test(out)) {
          bad.push(id);
        }
      }
    }
    expect(bad).to.eql([]);
    expect(rewritten).to.be.greaterThan(200);
  });
});
