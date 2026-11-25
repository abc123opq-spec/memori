import "mocha";
import { expect } from "chai";
import { HistoryEntrySummary_next, HistoryEntrySummary_progress } from "../src/models/historyEntrySummary";
import { Weight_build } from "../src/models/weight";
import { ISet } from "../src/types";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { ja } from "../src/i18n/ja";
import { Language_setForTest } from "../src/i18n/language";

function set(reps: number, weight: number, isAmrap?: boolean): ISet {
  return {
    vtype: "set",
    index: 0,
    id: "s",
    reps,
    weight: Weight_build(weight, "kg"),
    originalWeight: Weight_build(weight, "kg"),
    isAmrap,
    isCompleted: false,
  } as ISet;
}

describe("HistoryEntrySummary_next", () => {
  before(() => Translate_setDictionaryForTest(ja, "ja"));
  after(() => Language_setForTest(undefined));

  it("shows set count, reps per set and one weight in Japanese", () => {
    const summary = HistoryEntrySummary_next([set(5, 42.5), set(5, 42.5), set(5, 42.5, true)], "kg", "ja");
    expect(summary).to.deep.equal({ sets: "3セット", reps: "5・5・5+回", weight: "42.5", unit: "kg" });
  });

  it("falls back when the sets have different weights", () => {
    expect(HistoryEntrySummary_next([set(5, 40), set(5, 42.5)], "kg", "ja")).to.equal(undefined);
  });

  it("keeps the original layout in English", () => {
    expect(HistoryEntrySummary_next([set(5, 42.5)], "kg", "en")).to.equal(undefined);
  });

  it("shows how many sets are done in an ongoing workout", () => {
    const done = { ...set(5, 42.5), isCompleted: true, completedReps: 5 } as ISet;
    expect(HistoryEntrySummary_progress([done, set(5, 42.5), set(5, 42.5, true)], "kg", "ja")).to.deep.equal({
      done: "済 1/3",
      weight: "42.5",
      unit: "kg",
    });
    expect(HistoryEntrySummary_progress([done, set(5, 40)], "kg", "ja")).to.deep.equal({ done: "済 1/2" });
    expect(HistoryEntrySummary_progress([done], "kg", "en")).to.equal(undefined);
  });

  it("says bodyweight instead of 0kg", () => {
    expect(HistoryEntrySummary_next([set(5, 0), set(5, 0)], "kg", "ja")).to.deep.equal({
      sets: "2セット",
      reps: "5・5回",
      weight: "自重",
    });
  });

  it("is undefined without sets", () => {
    expect(HistoryEntrySummary_next([], "kg", "ja")).to.equal(undefined);
  });
});
