import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { PersonalArt_files, PersonalArt_get, PersonalArt_getFrom } from "../src/personal/art";

describe("personal art", () => {
  it("returns nothing for a slot without a picture", () => {
    expect(PersonalArt_getFrom({}, "onboarding", false)).to.equal(undefined);
  });

  it("points at images/personal and picks the dark picture in dark mode", () => {
    const files = { finishDay: { light: "a.png", dark: "a-dark.png", width: 240, height: 160 } };
    expect(PersonalArt_getFrom(files, "finishDay", false)?.uri).to.equal("/images/personal/a.png");
    expect(PersonalArt_getFrom(files, "finishDay", true)?.uri).to.equal("/images/personal/a-dark.png");
    expect(PersonalArt_getFrom(files, "finishDay", true)?.width).to.equal(240);
  });

  it("uses the light picture in dark mode when there is no dark one", () => {
    const files = { onboarding: { light: "b.png", width: 240, height: 192 } };
    expect(PersonalArt_getFrom(files, "onboarding", true)?.uri).to.equal("/images/personal/b.png");
  });

  it("has every registered picture on disk", () => {
    for (const slot of ["onboarding", "emptyHistory", "finishDay"] as const) {
      const art = PersonalArt_files[slot];
      expect(art, slot).to.not.equal(undefined);
      for (const isDark of [false, true]) {
        const uri = PersonalArt_get(slot, isDark)!.uri;
        expect(fs.existsSync(path.join(process.cwd(), uri)), uri).to.equal(true);
      }
    }
  });
});
