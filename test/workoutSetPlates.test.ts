import "mocha";
import { expect } from "chai";
import { ISet } from "../src/types";
import { Settings_build } from "../src/models/settings";
import { WorkoutSetPlates_line, WorkoutSetPlates_text } from "../src/utils/workoutSetPlates";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { ja } from "../src/i18n/ja";

function set(weight: number | undefined, completedWeight?: number): ISet {
  return {
    vtype: "set",
    id: "s1",
    index: 0,
    reps: 5,
    isCompleted: completedWeight != null,
    weight: weight != null ? { value: weight, unit: "lb" } : undefined,
    completedWeight: completedWeight != null ? { value: completedWeight, unit: "lb" } : undefined,
  };
}

describe("WorkoutSetPlates", () => {
  const settings = Settings_build();

  it("formats one side for a barbell exercise and flags an exact match", () => {
    expect(WorkoutSetPlates_line(set(135), settings, { id: "squat", equipment: "barbell" }, false)).to.eql({
      text: "45",
      exact: true,
      bars: [{ name: undefined, plates: [{ value: 45, unit: "lb" }], text: "45" }],
      chips: undefined,
    });
  });

  it("prefers the completed weight and flags a weight the plates cannot reach", () => {
    const line = WorkoutSetPlates_line(set(135, 137), settings, { id: "squat", equipment: "barbell" }, false);
    expect(line?.exact).to.eql(false);
  });

  it("returns nothing without a weight, without equipment, or when the bar alone is enough", () => {
    expect(WorkoutSetPlates_line(set(undefined), settings, { id: "squat", equipment: "barbell" }, false)).to.eql(
      undefined
    );
    expect(WorkoutSetPlates_line(set(135), settings, { id: "pushUp", equipment: "bodyweight" }, false)).to.eql(
      undefined
    );
    expect(WorkoutSetPlates_line(set(45), settings, { id: "squat", equipment: "barbell" }, false)).to.eql(undefined);
  });
});

describe("WorkoutSetPlates_text", () => {
  const settings = Settings_build();
  const kg = Settings_build("kg");
  const kgSet = (value: number): ISet => ({ ...set(undefined), weight: { value, unit: "kg" } });
  afterEach(() => Translate_setDictionaryForTest(ja, "en"));

  it("names the plates on one side and the bar in Japanese", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(WorkoutSetPlates_text(kgSet(60), kg, { id: "squat", equipment: "barbell" }, false)).to.equal(
      "片側 20kg、バー 20kg"
    );
    expect(WorkoutSetPlates_text(kgSet(42.5), kg, { id: "squat", equipment: "barbell" }, false)).to.equal(
      "片側 10kg＋1.25kg、バー 20kg"
    );
  });

  it("leaves the plate picture without its slash text in Japanese", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(
      WorkoutSetPlates_line(kgSet(42.5), kg, { id: "squat", equipment: "barbell" }, false)?.bars?.[0].text
    ).to.equal("");
  });

  it("names the plates on one side and the bar in English", () => {
    Translate_setDictionaryForTest(ja, "en");
    expect(WorkoutSetPlates_text(kgSet(60), kg, { id: "squat", equipment: "barbell" }, false)).to.equal(
      "20 kg per side + bar 20 kg"
    );
    expect(WorkoutSetPlates_text(set(135), settings, { id: "squat", equipment: "barbell" }, false)).to.equal(
      "45 lb per side + bar 45 lb"
    );
  });

  it("returns nothing without equipment, without a weight, or with the bar alone", () => {
    expect(WorkoutSetPlates_text(set(135), settings, { id: "pushUp", equipment: "bodyweight" }, false)).to.equal(
      undefined
    );
    expect(WorkoutSetPlates_text(set(undefined), settings, { id: "squat", equipment: "barbell" }, false)).to.equal(
      undefined
    );
    expect(WorkoutSetPlates_text(set(45), settings, { id: "squat", equipment: "barbell" }, false)).to.equal(undefined);
  });

  it("falls back to the load line for equipment that is not a two-sided bar", () => {
    const line = WorkoutSetPlates_line(set(50), settings, { id: "bicepCurl", equipment: "dumbbell" }, false);
    expect(WorkoutSetPlates_text(set(50), settings, { id: "bicepCurl", equipment: "dumbbell" }, false)).to.equal(
      line?.text
    );
  });
});
