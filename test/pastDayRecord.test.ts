import "mocha";
import { expect } from "chai";
import { PastDay_buildRecord, PastDay_canAdd, PastDay_mergeIntoHistory } from "../src/models/pastDayRecord";
import { IHistoryRecord } from "../src/types";

describe("PastDay", () => {
  const now = new Date(2026, 10, 26, 8, 30).getTime();

  it("offers adding a workout only for days before today", () => {
    expect(PastDay_canAdd(new Date(2026, 10, 25, 23, 59).getTime(), now)).to.equal(true);
    expect(PastDay_canAdd(new Date(2026, 10, 26, 0, 0).getTime(), now)).to.equal(false);
    expect(PastDay_canAdd(new Date(2026, 10, 27, 9).getTime(), now)).to.equal(false);
  });

  it("builds an empty ad-hoc record at noon of that day", () => {
    const record = PastDay_buildRecord(new Date(2026, 10, 23, 7).getTime(), now);
    const noon = new Date(2026, 10, 23, 12).getTime();
    expect(record.id).to.equal(now);
    expect(record.programId).to.equal("emptyprogram");
    expect(record.vtype).to.equal("history_record");
    expect(record.startTime).to.equal(noon);
    expect(record.endTime).to.equal(noon);
    expect(Date.parse(record.date)).to.equal(noon);
    expect(record.entries).to.eql([]);
  });

  it("drops a new record without exercises and keeps the history in date order", () => {
    const at = (d: number, id: number): IHistoryRecord =>
      ({ ...PastDay_buildRecord(new Date(2026, 10, d).getTime(), id), entries: [{}] }) as unknown as IHistoryRecord;
    const history = [at(25, 1), at(20, 2)];
    expect(PastDay_mergeIntoHistory(history, PastDay_buildRecord(new Date(2026, 10, 23).getTime(), 9))).to.equal(
      history
    );
    const added = PastDay_mergeIntoHistory(history, at(23, 9));
    expect(added.map((h) => h.id)).to.eql([1, 9, 2]);
    expect(PastDay_mergeIntoHistory(history, at(10, 9)).map((h) => h.id)).to.eql([1, 2, 9]);
  });

  it("replaces a record that is already in the history", () => {
    const first = { ...PastDay_buildRecord(new Date(2026, 10, 23).getTime(), 9), entries: [] };
    const history = [first];
    expect(PastDay_mergeIntoHistory(history, { ...first, dayName: "x" })[0].dayName).to.equal("x");
  });
});
