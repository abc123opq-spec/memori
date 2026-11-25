import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import {
  PersonalUnits_defaults,
  PersonalUnits_lbTextToKg,
  PersonalUnits_exampleOnerm,
  PersonalUnits_exampleWeekLabel,
  PersonalUnits_skipUnitScreen,
  PersonalUnits_withoutMicroPlates,
  PersonalUnits_roundSmallIncrements,
  PersonalUnits_programToUnit,
} from "../src/models/personalUnits";
import { WarmupScheme_prescribe, WarmupScheme_resolve } from "../src/models/warmupScheme";
import { Weight_build, Weight_calculatePlates, Weight_print } from "../src/models/weight";
import { IExerciseType, ISettings, IWeight } from "../src/types";
import { PlannerProgram_switchToUnit } from "../src/pages/planner/models/plannerProgram";
import { Settings_build } from "../src/models/settings";
import { Program_create, Program_evaluate } from "../src/models/program";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { ja } from "../src/i18n/ja";
import { Language_setForTest } from "../src/i18n/language";

describe("PersonalUnits", () => {
  after(() => Language_setForTest(undefined));

  it("defaults to kg and cm in Japanese, lb and in in English", () => {
    expect(PersonalUnits_defaults("ja")).to.deep.equal({ units: "kg", lengthUnits: "cm" });
    expect(PersonalUnits_defaults("en")).to.deep.equal({ units: "lb", lengthUnits: "in" });
    expect(PersonalUnits_skipUnitScreen("ja")).to.equal(true);
    expect(PersonalUnits_skipUnitScreen("en")).to.equal(false);
  });

  it("converts lb in prose to gym kg values", () => {
    expect(PersonalUnits_lbTextToKg("毎回5lbずつ増やします").text).to.equal("毎回2.5kgずつ増やします");
    expect(PersonalUnits_lbTextToKg("バーは45lbです").text).to.equal("バーは20kgです");
    expect(PersonalUnits_lbTextToKg("**10lb** 上げます。約135lbです").text).to.equal("**5kg** 上げます。約60kgです");
    expect(PersonalUnits_lbTextToKg("体重1ポンドあたり").flagged).to.have.length(1);
    expect(PersonalUnits_lbTextToKg("`1x5 / 135lb`").text).to.equal("`1x5 / 60kg`");
    expect(PersonalUnits_lbTextToKg("毎回5lbずつ").flagged).to.deep.equal([]);
  });

  it("leaves code blocks, directives and protected frontmatter alone", () => {
    const code = "```\nSquat / 3x5 135lb\n```";
    expect(PersonalUnits_lbTextToKg(code).text).to.equal(code);
    const md =
      '---\nid: x\nname: "10lb"\nshortDescription: "15〜25lb伸びます"\n---\n:::exercise-example{weekLabels="+20lb"}\n';
    expect(PersonalUnits_lbTextToKg(md).text).to.equal(
      '---\nid: x\nname: "10lb"\nshortDescription: "7.5〜10kg伸びます"\n---\n:::exercise-example{weekLabels="+20lb"}\n'
    );
  });

  it("flags lines a machine cannot decide", () => {
    const paired = PersonalUnits_lbTextToKg("5lbまたは2.5kg上げます");
    expect(paired.text).to.equal("5lbまたは2.5kg上げます");
    expect(paired.flagged).to.have.length(1);
    const range = PersonalUnits_lbTextToKg("15〜30lb足します");
    expect(range.text).to.equal("7.5〜12.5kg足します");
    expect(range.flagged).to.have.length(1);
    const record = PersonalUnits_lbTextToKg("2,237lbを挙げた");
    expect(record.text).to.equal("約1,015kgを挙げた");
    expect(record.flagged).to.have.length(1);
    expect(PersonalUnits_lbTextToKg("脂肪を数lb落とした").flagged).to.have.length(1);
  });

  it("reads example 1RM as lb", () => {
    expect(PersonalUnits_exampleOnerm("135", "kg")).to.equal(60);
    expect(PersonalUnits_exampleOnerm("135", "lb")).to.equal(135);
    expect(PersonalUnits_exampleOnerm("", "kg")).to.equal(undefined);
  });

  it("labels example weeks in the user's language and units", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalUnits_exampleWeekLabel("Week 1", "80%", "kg")).to.equal("1週目（80%）");
    expect(PersonalUnits_exampleWeekLabel("Week 4", "Base +20lb", "kg")).to.equal("4週目（Base +10kg）");
    expect(PersonalUnits_exampleWeekLabel("Week 2", undefined, "kg")).to.equal("2週目");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalUnits_exampleWeekLabel("Week 1", "+20lb", "lb")).to.equal("Week 1 (+20lb)");
  });

  it("switches a built-in program's Liftoscript to kg", () => {
    const detail = JSON.parse(fs.readFileSync("programdata/programs/builtin/basicBeginner.json", "utf8"));
    const planner = PlannerProgram_switchToUnit(detail.planner, Settings_build("kg"));
    const text = planner.weeks.flatMap((w) => w.days.map((d) => d.exerciseText)).join("\n");
    expect(text).to.not.match(/\dlb/);
    expect(text).to.match(/20kg/);
  });

  it("drops the 0.5kg plates so kg weights stay on 2.5kg steps, and leaves lb alone", () => {
    const row = { id: "bentOverRow", equipment: "barbell" } as IExerciseType;
    const warmups = (settings: ISettings, w: IWeight): string[] =>
      WarmupScheme_prescribe(WarmupScheme_resolve(row, settings, undefined), w, row, settings).map((p) =>
        Weight_print(p.weight)
      );
    const working = (settings: ISettings, value: number): number =>
      Weight_calculatePlates(Weight_build(value, "kg"), settings, "kg", row).totalWeight.value;
    const kg = PersonalUnits_withoutMicroPlates(Settings_build("kg"));
    const plates = kg.gyms[0].equipment.barbell?.setup;
    expect(plates?.type === "plates" ? plates.plates.map((p) => p.weight) : []).to.not.include(0.5);
    expect(warmups(kg, Weight_build(42.5, "kg"))).to.deep.equal(["32.5kg"]);
    expect(warmups(kg, Weight_build(100, "kg"))).to.deep.equal(["30kg", "50kg", "80kg"]);
    expect(working(Settings_build("kg"), 43.75)).to.equal(43.5);
    expect(working(kg, 43.75)).to.equal(42.5);
    expect(working(kg, 21.25)).to.equal(20);
    const lb = Settings_build("lb");
    expect(PersonalUnits_withoutMicroPlates(lb)).to.deep.equal(lb);
  });

  it("rounds small kg progression steps up to 2.5kg and leaves zero, percent and lb alone", () => {
    expect(PersonalUnits_roundSmallIncrements("A / 3x5 / 20kg / progress: lp(1.25kg, 1, 0, 10%, 2, 0)", "kg")).to.equal(
      "A / 3x5 / 20kg / progress: lp(2.5kg, 1, 0, 10%, 2, 0)"
    );
    expect(PersonalUnits_roundSmallIncrements("/ progress: custom(increase: 1.25kg) {~", "kg")).to.equal(
      "/ progress: custom(increase: 2.5kg) {~"
    );
    expect(PersonalUnits_roundSmallIncrements("A / progress: dp(1.25kg, 8, 12)", "kg")).to.equal(
      "A / progress: dp(2.5kg, 8, 12)"
    );
    expect(PersonalUnits_roundSmallIncrements("A / progress: lp(2.5kg, 1, -1kg)", "kg")).to.equal(
      "A / progress: lp(2.5kg, 1, -2.5kg)"
    );
    expect(PersonalUnits_roundSmallIncrements("A / 3x5 / 1kg / progress: lp(5kg, 1, 0kg)", "kg")).to.equal(
      "A / 3x5 / 1kg / progress: lp(5kg, 1, 0kg)"
    );
    const lb = "A / 3x5 / 45lb / progress: lp(2.5lb, 1, 0, 10%, 2, 0)";
    expect(PersonalUnits_roundSmallIncrements(lb, "lb")).to.equal(lb);
  });

  it("gives every built-in program 2.5kg steps after the kg switch", () => {
    const detail = JSON.parse(fs.readFileSync("programdata/programs/builtin/basicBeginner.json", "utf8"));
    const planner = PersonalUnits_programToUnit(detail.planner, Settings_build("kg"));
    const text = planner.weeks.flatMap((w) => w.days.map((d) => d.exerciseText)).join("\n");
    expect(text).to.contain("custom(increase: 2.5kg)");
    expect(PersonalUnits_programToUnit(detail.planner, Settings_build("lb"))).to.deep.equal(detail.planner);
  });

  it("switches Candito's 5lb step state variable to 2.5kg", () => {
    const detail = JSON.parse(fs.readFileSync("programdata/programs/builtin/candito-6-week.json", "utf8"));
    const planner = PlannerProgram_switchToUnit(detail.planner, Settings_build("kg"));
    const text = planner.weeks.flatMap((w) => w.days.map((d) => d.exerciseText)).join("\n");
    expect(text).to.contain("step: 2.5kg");
    expect(text.replace(/\/\/.*$/gm, "")).to.not.match(/\dlb/);
  });

  it("converts every built-in program to kg without lb, odd steps or evaluation errors", () => {
    const dir = "programdata/programs/builtin";
    const settings = Settings_build("kg");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).to.equal(64);
    const problems: string[] = [];
    for (const f of files) {
      const detail = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
      const planner = PersonalUnits_programToUnit(detail.planner, settings);
      const text = planner.weeks
        .flatMap((w) => w.days.map((d) => d.exerciseText))
        .join("\n")
        .replace(/\/\/.*$/gm, "");
      if (/\d(\.\d+)?lb/.test(text)) {
        problems.push(`${f}: lb`);
      }
      const odd = (text.match(/-?\d+(\.\d+)?kg/g) || []).filter((v) => {
        const n = Math.abs(parseFloat(v));
        return n !== 0 && Math.abs(n / 1.25 - Math.round(n / 1.25)) > 1e-6;
      });
      if (odd.length > 0) {
        problems.push(`${f}: ${odd.slice(0, 3).join(",")}`);
      }
      const evaluated = Program_evaluate({ ...Program_create(f, f), planner }, settings);
      if (evaluated.errors.length > 0) {
        problems.push(`${f}: ${JSON.stringify(evaluated.errors[0]).slice(0, 120)}`);
      }
    }
    expect(problems).to.eql([]);
  });
});
