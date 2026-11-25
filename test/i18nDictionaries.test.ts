import "mocha";
import { expect } from "chai";
import { jaDictionaries, jaExerciseNames } from "../src/i18n/ja";
import { allExercisesList } from "../src/models/exercise";

describe("Japanese dictionaries", () => {
  it("has no empty value and no value that equals its key", () => {
    const bad: string[] = [];
    for (const [file, dict] of Object.entries(jaDictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        if (value.trim() === "" || value === key.split("@@")[0]) {
          bad.push(`${file}: ${key}`);
        }
      }
    }
    expect(bad).to.deep.equal([]);
  });

  it("has no key with different values in two files", () => {
    const seen: Record<string, string> = {};
    const bad: string[] = [];
    for (const [file, dict] of Object.entries(jaDictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        if (key in seen && seen[key] !== value) {
          bad.push(`${file}: ${key}`);
        }
        seen[key] = value;
      }
    }
    expect(bad).to.deep.equal([]);
  });

  it("keeps the context part of a key non-empty and free of spaces around it", () => {
    const bad = Object.values(jaDictionaries).flatMap((d) =>
      Object.keys(d).filter(
        (k) =>
          k.includes("@@") &&
          (k.split("@@").length !== 2 || /^\s|\s$/.test(k.split("@@")[1]) || k.split("@@")[1] === "")
      )
    );
    expect(bad).to.deep.equal([]);
  });

  it("keeps surrounding spaces out of the keys", () => {
    const bad = Object.values(jaDictionaries).flatMap((d) => Object.keys(d).filter((k) => k !== k.trim()));
    expect(bad).to.deep.equal([]);
  });

  it("names only exercises that exist", () => {
    expect(Object.keys(jaExerciseNames).filter((id) => !allExercisesList[id])).to.deep.equal([]);
  });
});
