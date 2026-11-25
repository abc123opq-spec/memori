import "mocha";
import { expect } from "chai";
import { PersonalSource_url } from "../src/personal/source";

describe("PersonalSource_url", () => {
  it("points a GitHub Pages copy to its own repository and commit", () => {
    expect(PersonalSource_url("someone.github.io", "/memori/", "abc1234")).to.equal(
      "https://github.com/someone/memori/tree/abc1234"
    );
    expect(PersonalSource_url("Someone.GitHub.io", "/memori/index.html", undefined)).to.equal(
      "https://github.com/Someone/memori"
    );
  });

  it("uses the user site repository at the root path", () => {
    expect(PersonalSource_url("someone.github.io", "/", "")).to.equal("https://github.com/someone/someone.github.io");
  });

  it("has no repository for other hosts", () => {
    expect(PersonalSource_url("localhost", "/memori/", "abc")).to.equal(undefined);
    expect(PersonalSource_url("evil.github.io.example.com", "/x/", "abc")).to.equal(undefined);
  });
});
