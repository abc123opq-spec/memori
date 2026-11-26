import { IHistoryRecord } from "../types";
import { emptyProgramId } from "./program";

const NOON = 12;

function dayStart(time: number): number {
  const d = new Date(time);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// personal-fork: workouts can be logged afterwards for days before today
export function PastDay_canAdd(day: number, now: number): boolean {
  return dayStart(day) < dayStart(now);
}

export function PastDay_buildRecord(day: number, now: number): IHistoryRecord {
  const d = new Date(day);
  const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), NOON).getTime();
  return {
    vtype: "history_record",
    id: now,
    date: new Date(noon).toISOString(),
    programId: emptyProgramId,
    programName: "Ad-Hoc Workout",
    day: 1,
    dayName: "",
    entries: [],
    startTime: noon,
    endTime: noon,
    intervals: [],
    updatedAt: now,
  };
}

// A record that was never in the history joins it only when it has exercises, so backing out leaves nothing behind
export function PastDay_mergeIntoHistory(history: IHistoryRecord[], record: IHistoryRecord): IHistoryRecord[] {
  if (history.some((h) => h.id === record.id)) {
    return history.map((h) => (h.id === record.id ? record : h));
  }
  if (record.entries.length === 0) {
    return history;
  }
  const time = Date.parse(record.date);
  const index = history.findIndex((h) => Date.parse(h.date) < time);
  return index === -1 ? [...history, record] : [...history.slice(0, index), record, ...history.slice(index)];
}
