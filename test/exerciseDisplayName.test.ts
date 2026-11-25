import "mocha";
import { expect } from "chai";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import {
  ExerciseDisplayName_full,
  ExerciseDisplayName_withEquipment,
  ExerciseDisplayName_reverse,
  ExerciseDisplayName_equipment,
} from "../src/i18n/exerciseDisplayName";
import { Exercise_get, Exercise_fullName, IExercise } from "../src/models/exercise";
import { Settings_build } from "../src/models/settings";

const settings = Settings_build();
const bench = Exercise_get({ id: "benchPress", equipment: "barbell" }, settings.exercises);

describe("ExerciseDisplayName", () => {
  afterEach(() => Translate_setDictionaryForTest({}, "en"));

  it("uses the Japanese names with full-width parentheses", () => {
    Translate_setDictionaryForTest({}, "ja");
    expect(ExerciseDisplayName_withEquipment(bench, settings)).to.equal("ベンチプレス（バーベル）");
    expect(ExerciseDisplayName_reverse(bench, settings)).to.equal("バーベル ベンチプレス");
    expect(ExerciseDisplayName_equipment("barbell", {})).to.equal("バーベル");
  });

  it("puts the label before the name with a full-width colon", () => {
    Translate_setDictionaryForTest({}, "ja");
    const other = { ...bench, defaultEquipment: "dumbbell" } as IExercise;
    expect(ExerciseDisplayName_full(other, settings, "A")).to.equal("A：ベンチプレス（バーベル）");
    expect(ExerciseDisplayName_full(bench, settings)).to.equal("ベンチプレス");
  });

  it("keeps custom exercises and custom equipment as they are", () => {
    Translate_setDictionaryForTest({}, "ja");
    const custom = { id: "myCustomId", name: "My Squat", equipment: "barbell" } as IExercise;
    expect(ExerciseDisplayName_withEquipment(custom, settings)).to.equal("My Squat（バーベル）");
    const renamed = { ...bench, name: "My Bench" } as IExercise;
    expect(ExerciseDisplayName_withEquipment(renamed, settings)).to.equal("My Bench（バーベル）");
    const equipment = { barbell: { name: "Olympic Bar" } } as never;
    expect(ExerciseDisplayName_equipment("barbell", equipment)).to.equal("Olympic Bar");
  });

  it("returns the English name in English, same as the models", () => {
    Translate_setDictionaryForTest({}, "en");
    expect(ExerciseDisplayName_withEquipment(bench, settings)).to.equal("Bench Press, Barbell");
    expect(ExerciseDisplayName_full(bench, settings, "A")).to.equal(Exercise_fullName(bench, settings, "A"));
  });
});
