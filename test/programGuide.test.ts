import "mocha";
import { expect } from "chai";
import { ProgramGuide_builtinId, ProgramGuide_markdown } from "../src/models/programGuide";
import { IProgramIndexEntry } from "../src/models/program";
import { IProgram } from "../src/types";

function entry(id: string, shortDescription: string, url: string): IProgramIndexEntry {
  return { id, name: id, author: "", authorUrl: "", url, shortDescription, isMultiweek: false, tags: [] };
}

const index = [
  entry("a", "desc a", "https://gainzfever.com/"),
  entry("b", "desc b", "https://gainzfever.com/"),
  entry("c", "desc c", "https://one.example/"),
];

function program(p: Partial<IProgram>): IProgram {
  return { id: "zzz", name: "copy", url: "", shortDescription: "", ...p } as IProgram;
}

describe("ProgramGuide_builtinId", () => {
  it("matches by id", () => {
    expect(ProgramGuide_builtinId(program({ id: "b" }), index)).to.equal("b");
  });
  it("matches a clone by shortDescription", () => {
    expect(ProgramGuide_builtinId(program({ shortDescription: "desc b", name: "renamed" }), index)).to.equal("b");
  });
  it("matches by a unique url", () => {
    expect(ProgramGuide_builtinId(program({ url: "https://one.example/" }), index)).to.equal("c");
  });
  it("gives up on a shared url when the description differs", () => {
    expect(
      ProgramGuide_builtinId(program({ url: "https://gainzfever.com/", shortDescription: "other" }), index)
    ).to.equal(undefined);
  });
  it("gives up on an empty url", () => {
    expect(ProgramGuide_builtinId(program({}), index)).to.equal(undefined);
  });
});

describe("ProgramGuide_markdown", () => {
  it("drops everything before the more marker", () => {
    const r = ProgramGuide_markdown({ fullDescription: "short\n<!-- more -->\nlong [x](/programs/a)" }, ["a"]);
    expect(r.body).to.equal("long [x](#program-guide:a)");
    expect(r.faq).to.equal(undefined);
  });
  it("returns the faq separately and rewrites its links", () => {
    const r = ProgramGuide_markdown({ fullDescription: "body", faq: "### Q\n[x](/programs/a)" }, ["a"]);
    expect(r.body).to.equal("body");
    expect(r.faq).to.equal("### Q\n[x](#program-guide:a)");
  });
});
