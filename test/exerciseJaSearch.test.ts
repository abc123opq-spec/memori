import "mocha";
import { expect } from "chai";
import {
  Exercise_allExpanded,
  Exercise_filterAndRankByQuery,
  Exercise_filterExercises,
  Exercise_matchesQuery,
} from "../src/models/exercise";
import { ExerciseJaSearch_normalize } from "../src/models/exerciseJaSearch";

describe("Japanese exercise search", () => {
  const all = Exercise_allExpanded({});
  const ids = (list: { id: string }[]): string[] => list.map((e) => e.id);

  it("finds a built-in exercise by its Japanese name, best match first", () => {
    const found = Exercise_filterAndRankByQuery(all, "スクワット");
    expect(found.length).to.be.greaterThan(0);
    expect(found[0].id).to.equal("squat");
    expect(found.length).to.be.lessThan(all.length);
  });

  it("treats hiragana like katakana", () => {
    expect(ids(Exercise_filterAndRankByQuery(all, "すくわっと"))).to.eql(
      ids(Exercise_filterAndRankByQuery(all, "スクワット"))
    );
  });

  it("matches part of a long name and ignores spaces and brackets", () => {
    expect(ids(Exercise_filterAndRankByQuery(all, "ロープホリゾンタル"))).to.include(
      "standingRowRearHorizontalDeltWithRope"
    );
    expect(ids(Exercise_filterAndRankByQuery(all, "ロープ　ホリゾンタル"))).to.include(
      "standingRowRearHorizontalDeltWithRope"
    );
    expect(ExerciseJaSearch_normalize("ベンチプレス（バーベル）")).to.equal("ベンチプレスバーベル");
  });

  it("matches a prefix and the Japanese equipment name", () => {
    const bench = Exercise_filterAndRankByQuery(all, "ベンチ");
    expect(ids(bench)).to.include("benchPress");
    expect(
      Exercise_matchesQuery({ id: "benchPress", name: "Bench Press", equipment: "barbell" }, "ベンチ バーベル")
    ).to.equal(true);
    expect(Exercise_matchesQuery({ name: "Bench Press", equipment: "barbell" }, "ベンチ")).to.equal(true);
    expect(Exercise_matchesQuery({ name: "Squat", equipment: "barbell" }, "ベンチ")).to.equal(false);
  });

  it("keeps English results and order", () => {
    const squat = Exercise_filterAndRankByQuery(all, "Squat");
    expect(squat[0].id).to.equal("squat");
    expect(squat.every((e) => e.name.toLowerCase().includes("squat"))).to.equal(true);
    expect(ids(Exercise_filterExercises(all, "スクワット"))).to.include("squat");
    expect(Exercise_filterExercises(all, "Squat").length).to.equal(
      all.filter((e) => e.name.toLowerCase().includes("squat")).length
    );
  });
});
