import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import { PersonalAppWidth_get } from "../src/personal/appWidth";

describe("PersonalAppWidth_get", () => {
  it("uses the window width on phones and the 640px column from 720px up", () => {
    expect(PersonalAppWidth_get(375)).to.equal(375);
    expect(PersonalAppWidth_get(719)).to.equal(719);
    expect(PersonalAppWidth_get(720)).to.equal(640);
    expect(PersonalAppWidth_get(1440)).to.equal(640);
  });

  it("matches the column in index.css", () => {
    const css = fs.readFileSync("src/index.css", "utf8");
    expect(css).to.contain("@media (min-width: 720px)");
    expect(css).to.contain("max-width: 640px");
  });
});
