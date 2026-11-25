import "mocha";
import { expect } from "chai";
import {
  PersonalFormat_clock,
  PersonalFormat_duration,
  PersonalFormat_label,
  PersonalFormat_prMark,
  PersonalFormat_recordTitle,
  PersonalFormat_statLabel,
  PersonalFormat_timerLabel,
  PersonalFormat_variableLabel,
  PersonalFormat_volume,
} from "../src/personal/format";
import { Weight_build, Weight_display } from "../src/models/weight";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { Language_setForTest } from "../src/i18n/language";
import { ja } from "../src/i18n/ja";

const MIN = 60 * 1000;

describe("PersonalFormat", () => {
  afterEach(() => Language_setForTest(undefined));

  it("writes durations in minutes, with hours from 60 minutes", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_duration(0)).to.equal("0分");
    expect(PersonalFormat_duration(32 * MIN + 20000)).to.equal("32分");
    expect(PersonalFormat_duration(65 * MIN)).to.equal("1時間5分");
    expect(PersonalFormat_duration(120 * MIN)).to.equal("2時間0分");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_duration(42 * MIN)).to.equal("42 mins");
    expect(PersonalFormat_duration(65 * MIN)).to.equal("1 h 5 mins");
  });

  it("writes the rest clock as m:ss in Japanese and mm:ss in English", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_clock(84000)).to.equal("1:24");
    expect(PersonalFormat_clock(180000)).to.equal("3:00");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_clock(150000)).to.equal("02:30");
  });

  it("tells a workout that has not started from a paused one", () => {
    expect(PersonalFormat_timerLabel([])).to.equal("Not started");
    expect(PersonalFormat_timerLabel([[1000, 2000]])).to.equal("Paused");
    expect(PersonalFormat_timerLabel([[1000, undefined]])).to.equal("Ongoing workout");
  });

  it("names an ad-hoc workout without a week", () => {
    Translate_setDictionaryForTest(ja, "ja");
    const adhoc = { dayName: "", programName: "Ad-Hoc Workout", programId: "emptyprogram", week: 1 };
    expect(PersonalFormat_recordTitle(adhoc, true)).to.deep.equal({ title: "単発のワークアウト", subtitle: "" });
    const day = { dayName: "Workout A", programName: "ベーシック", programId: "x", week: 1 };
    expect(PersonalFormat_recordTitle(day, true)).to.deep.equal({ title: "Workout A", subtitle: "ベーシック・1週目" });
    expect(PersonalFormat_recordTitle(day, false)).to.deep.equal({ title: "Workout A", subtitle: "ベーシック" });
  });

  it("names per-set program values in words in Japanese only", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_variableLabel("weights[1]")).to.equal("セット1の重量");
    expect(PersonalFormat_variableLabel("reps[3]")).to.equal("セット3の回数");
    expect(PersonalFormat_variableLabel("increase")).to.equal("increase");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_variableLabel("weights[1]")).to.equal("weights[1]");
  });

  it("puts no space after a full-width colon", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_label("Average time of a workout:")).to.equal("ワークアウトの平均所要時間：");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_label("Average time of a workout:")).to.equal("Average time of a workout: ");
  });

  it("marks a PR with letters in Japanese and the trophy in English", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_prMark()).to.equal(" PR");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_prMark()).to.equal(" \u{1F3C6}");
  });

  it("groups thousands and keeps the unit next to the number in Japanese", () => {
    Translate_setDictionaryForTest(ja, "ja");
    expect(PersonalFormat_volume(Weight_build(1485, "kg"))).to.equal("1,485kg");
    expect(PersonalFormat_volume(Weight_build(212.5, "kg"))).to.equal("212.5kg");
    expect(PersonalFormat_statLabel("Volume")).to.equal("ボリューム");
    expect(Weight_display(Weight_build(42.5, "kg"))).to.equal("42.5kg");
    Translate_setDictionaryForTest(ja, "en");
    expect(PersonalFormat_volume(Weight_build(3270, "lb"))).to.equal("3270 lb");
    expect(PersonalFormat_statLabel("Volume")).to.equal("Volume: ");
    expect(Weight_display(Weight_build(42.5, "kg"))).to.equal("42.5 kg");
  });
});
