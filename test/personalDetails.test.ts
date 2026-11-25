import "mocha";
import { expect } from "chai";
import { ja } from "../src/i18n/ja";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { IEvaluatedProgram, Program_daysAndExercises, Program_joinParts } from "../src/models/program";
import {
  EquipmentSetupEdit_bandColorLabel,
  EquipmentSetupEdit_bandNameLabel,
  EquipmentSetupEdit_defaultBandsFor,
} from "../src/models/equipmentSetupEdit";
import { PlannerSyntaxError, PlannerSyntaxError_displayMessage } from "../src/pages/planner/plannerExerciseEvaluator";

function evaluated3x3(): IEvaluatedProgram {
  const exercise = { notused: false, exerciseType: { id: "squat", equipment: "barbell" } };
  const day = { exercises: [exercise, exercise, exercise] };
  return { weeks: [{ days: [day, day, day] }] } as unknown as IEvaluatedProgram;
}

function unknownExerciseError(): PlannerSyntaxError {
  return PlannerSyntaxError.fromPoint(
    "Squat",
    "Unknown exercise Foo",
    { line: 3, offset: 5, from: 0, to: 3 },
    { type: "unknownExercise", data: { name: "Foo" } }
  );
}

describe("Personal details", () => {
  afterEach(() => Translate_setDictionaryForTest(ja, "en"));

  describe("in Japanese", () => {
    beforeEach(() => Translate_setDictionaryForTest(ja, "ja"));

    it("joins days and exercises with the Japanese comma", () => {
      expect(Program_daysAndExercises(evaluated3x3())).to.equal("週3日、1日3種目");
    });

    it("joins three parts with the Japanese comma", () => {
      expect(Program_joinParts(["3週間", "週3回", "1日3種目"])).to.equal("3週間、週3回、1日3種目");
    });

    it("shows the unknown exercise error with a full-width colon", () => {
      expect(PlannerSyntaxError_displayMessage(unknownExerciseError())).to.equal(
        "Squat：「Foo」という種目はありません (3:5)"
      );
    });

    it("translates the band color label and the default band name", () => {
      expect(EquipmentSetupEdit_bandColorLabel("yellow")).to.equal("黄");
      expect(EquipmentSetupEdit_bandColorLabel("gray")).to.equal("グレー");
      expect(EquipmentSetupEdit_bandNameLabel("Yellow")).to.equal("黄");
      expect(EquipmentSetupEdit_bandNameLabel("My band")).to.equal("My band");
    });

    it("keeps the stored band names in English", () => {
      const names = EquipmentSetupEdit_defaultBandsFor("kg").map((b) => b.name);
      expect(names).to.eql(["Yellow", "Red", "Blue", "Green", "Black"]);
    });

    it("words the progress toggle in context", () => {
      expect(ja["Suppress@@progress"]).to.equal("今回は進めない");
      expect(ja["Enable@@progress"]).to.equal("進める");
    });

    it("words the program info title", () => {
      expect(ja["Start {name}"]).to.equal("{name}を始める");
      expect(ja["Clone {name}"]).to.equal("{name}を複製");
    });
  });

  describe("in English", () => {
    beforeEach(() => Translate_setDictionaryForTest(ja, "en"));

    it("keeps the English comma", () => {
      expect(Program_daysAndExercises(evaluated3x3())).to.equal("3 days per week, 3 exercises per day");
      expect(Program_joinParts(["3 weeks", "3x/week"])).to.equal("3 weeks, 3x/week");
    });

    it("keeps the English error", () => {
      expect(PlannerSyntaxError_displayMessage(unknownExerciseError())).to.equal("Squat: Unknown exercise Foo (3:5)");
    });

    it("keeps the English band labels", () => {
      expect(EquipmentSetupEdit_bandColorLabel("yellow")).to.equal("Yellow");
    });
  });
});
