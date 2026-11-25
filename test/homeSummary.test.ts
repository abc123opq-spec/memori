import "mocha";
import { expect } from "chai";
import { HomeSummary_frequency, HomeSummary_lastWorkout, HomeSummary_week } from "../src/models/homeSummary";
import { IHistoryRecord, IProgram } from "../src/types";
import { IEvaluatedProgram, IProgramIndexEntry } from "../src/models/program";

function record(id: number, date: Date): IHistoryRecord {
  return { id, date: date.toISOString(), startTime: date.getTime() } as unknown as IHistoryRecord;
}

function program(daysPerWeek: number[]): IEvaluatedProgram {
  return { weeks: daysPerWeek.map((n) => ({ days: new Array(n).fill({}) })) } as unknown as IEvaluatedProgram;
}

describe("HomeSummary_week", () => {
  const wednesday = new Date(2026, 10, 25, 12).getTime();
  const history = [
    record(1, new Date(2026, 10, 23, 9)),
    record(2, new Date(2026, 10, 24, 9)),
    record(3, new Date(2026, 10, 18, 9)),
  ];

  it("counts this week's records, week starting Monday", () => {
    expect(HomeSummary_week(history, program([3]), wednesday, true)).to.deep.equal({ done: 2, target: 3 });
  });

  it("uses the smallest number of days per week as the target", () => {
    expect(HomeSummary_week(history, program([3, 2, 4]), wednesday, true).target).to.equal(2);
  });

  it("has no target without a program", () => {
    expect(HomeSummary_week(history, undefined, wednesday, true).target).to.equal(undefined);
  });

  it("puts Sunday 0:00 into the new week when the week starts on Sunday", () => {
    const sunday = new Date(2026, 10, 22, 0, 0, 0);
    const saturday = new Date(2026, 10, 21, 23, 59, 59);
    const h = [record(1, sunday), record(2, saturday)];
    expect(HomeSummary_week(h, undefined, wednesday, false).done).to.equal(1);
    expect(HomeSummary_week(h, undefined, wednesday, true).done).to.equal(0);
  });

  it("puts Sunday into the previous week when the week starts on Monday", () => {
    const sundayNight = new Date(2026, 10, 29, 23, 0, 0);
    expect(HomeSummary_week([record(1, sundayNight)], undefined, wednesday, true).done).to.equal(1);
    expect(HomeSummary_week([record(1, sundayNight)], undefined, wednesday, false).done).to.equal(0);
  });

  it("has no target for the ad-hoc empty program", () => {
    const empty = { ...program([1]), id: "emptyprogram" } as IEvaluatedProgram;
    expect(HomeSummary_week(history, empty, wednesday, true).target).to.equal(undefined);
  });

  it("uses the built-in program's days per week for a two-day rotation run three times a week", () => {
    const index = [
      { id: "basicBeginner", url: "https://thefitness.wiki/basic", frequency: 3 },
      { id: "gzclp", url: "https://example.com/gzclp", frequency: 4 },
    ] as IProgramIndexEntry[];
    const cloned = { id: "x1y2z3", url: "https://thefitness.wiki/basic" } as IProgram;
    const frequency = HomeSummary_frequency(cloned, index);
    expect(frequency).to.equal(3);
    const three = [
      record(1, new Date(2026, 10, 23, 9)),
      record(2, new Date(2026, 10, 24, 9)),
      record(3, new Date(2026, 10, 25, 9)),
    ];
    expect(HomeSummary_week(three, program([2]), wednesday, true, frequency)).to.deep.equal({ done: 3, target: 3 });
    expect(HomeSummary_week(three, program([2]), wednesday, true).target).to.equal(2);
    expect(HomeSummary_frequency({ id: "mine", url: "" } as IProgram, index)).to.equal(undefined);
  });

  it("is zero with no records", () => {
    expect(HomeSummary_week([], program([3]), wednesday, false)).to.deep.equal({ done: 0, target: 3 });
  });
});

describe("HomeSummary_lastWorkout", () => {
  it("is undefined with no records", () => {
    expect(HomeSummary_lastWorkout([])).to.equal(undefined);
  });

  it("returns the newest record's time", () => {
    const newest = new Date(2026, 10, 24, 9);
    const h = [record(1, new Date(2026, 10, 20, 9)), record(2, newest), record(3, new Date(2026, 10, 10, 9))];
    expect(HomeSummary_lastWorkout(h)).to.equal(newest.getTime());
  });
});
