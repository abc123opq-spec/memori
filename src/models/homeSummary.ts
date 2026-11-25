import { IHistoryRecord, IProgram } from "../types";
import { ProgramGuide_builtinId } from "./programGuide";
import { IEvaluatedProgram, IProgramIndexEntry, emptyProgramId } from "./program";
import { DateUtils_firstDayOfWeekTimestamp } from "../utils/date";

export function HomeSummary_week(
  history: IHistoryRecord[],
  program: IEvaluatedProgram | undefined,
  now: number,
  startWeekFromMonday: boolean,
  frequency?: number
): { done: number; target?: number } {
  const start = DateUtils_firstDayOfWeekTimestamp(now, startWeekFromMonday);
  const s = new Date(start);
  const end = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7).getTime();
  const done = history.filter((r) => {
    const t = Date.parse(r.date);
    return t >= start && t < end;
  }).length;
  if (program == null || program.id === emptyProgramId) {
    return { done, target: undefined };
  }
  const days = program.weeks.map((w) => w.days.length);
  return { done, target: frequency ?? (days.length > 0 ? Math.min(...days) : undefined) };
}

export function HomeSummary_frequency(program: IProgram, programsIndex: IProgramIndexEntry[]): number | undefined {
  const builtinId = ProgramGuide_builtinId(program, programsIndex);
  return programsIndex.find((e) => e.id === builtinId)?.frequency;
}

export function HomeSummary_lastWorkout(history: IHistoryRecord[]): number | undefined {
  const times = history.map((r) => Date.parse(r.date));
  return times.length > 0 ? Math.max(...times) : undefined;
}
