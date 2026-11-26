import "mocha";
import { expect } from "chai";
import { History_buildHomeWeekData } from "../src/models/history";
import { PastDay_buildRecord } from "../src/models/pastDayRecord";

function record(y: number, m: number, d: number) {
  const day = new Date(y, m - 1, d).getTime();
  return PastDay_buildRecord(day, day + 1);
}

function weeks(ts: number[]): string[] {
  return ts.map((t) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}-${d.getDate()}`;
  });
}

describe("History_buildHomeWeekData", () => {
  const now = new Date(2026, 10, 26, 9).getTime();

  it("includes the current week when records are only in past weeks", () => {
    const data = History_buildHomeWeekData([record(2026, 11, 18), record(2026, 11, 10)], false, now);
    expect(weeks(data.firstDayOfWeeks)).to.deep.equal(["11-8", "11-15", "11-22"]);
  });

  it("includes weeks without records between the first record and now", () => {
    const data = History_buildHomeWeekData([record(2026, 11, 3)], true, now);
    expect(weeks(data.firstDayOfWeeks)).to.deep.equal(["11-2", "11-9", "11-16", "11-23"]);
  });

  it("has only the current week for an empty history", () => {
    expect(weeks(History_buildHomeWeekData([], true, now).firstDayOfWeeks)).to.deep.equal(["11-23"]);
  });

  it("keeps a week per 7 days across years", () => {
    const data = History_buildHomeWeekData([record(2023, 11, 26)], false, now);
    expect(data.firstDayOfWeeks.length).to.equal(157);
    expect(weeks(data.firstDayOfWeeks).slice(-1)).to.deep.equal(["11-22"]);
  });
});
