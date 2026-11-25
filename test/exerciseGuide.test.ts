import "mocha";
import { expect } from "chai";
import { ExerciseGuide_hasGuide, ExerciseGuide_key } from "../src/models/exerciseGuide";

describe("ExerciseGuide", () => {
  it("knows built-in exercises with a guide", () => {
    expect(ExerciseGuide_hasGuide({ id: "bentOverRow", equipment: "barbell" })).to.equal(true);
    expect(ExerciseGuide_key({ id: "bentOverRow", equipment: "barbell" })).to.equal("bentoverrow_barbell");
  });
  it("has no guide for a custom exercise", () => {
    expect(ExerciseGuide_hasGuide({ id: "abcd1234", equipment: "barbell" })).to.equal(false);
  });
});
