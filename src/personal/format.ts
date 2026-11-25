import { Language_current } from "../i18n/language";
import { Translate_format, Translate_text } from "../i18n/translate";
import { IHistoryRecord, IIntervals, IWeight } from "../types";
import { emptyProgramId } from "../models/program";
import { History_isPaused } from "../models/history";
import { TimeUtils_formatMMSS } from "../utils/time";

const MS_PER_MINUTE = 60 * 1000;

export function PersonalFormat_duration(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / MS_PER_MINUTE);
  if (minutes < 60) {
    return Translate_format("{n} mins", { n: minutes });
  }
  return Translate_format("{h} h {m} mins", { h: Math.floor(minutes / 60), m: minutes % 60 });
}

export function PersonalFormat_clock(ms: number): string {
  if (Language_current() !== "ja") {
    return TimeUtils_formatMMSS(ms);
  }
  const total = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function PersonalFormat_timerLabel(intervals: IIntervals | undefined): string {
  if (intervals != null && intervals.length === 0) {
    return "Not started";
  }
  return History_isPaused(intervals) ? "Paused" : "Ongoing workout";
}

export function PersonalFormat_recordTitle(
  record: Pick<IHistoryRecord, "dayName" | "programName" | "programId" | "week">,
  isCurrent: boolean
): { title: string; subtitle: string } {
  if (record.programId === emptyProgramId) {
    return { title: Translate_text(record.programName), subtitle: "" };
  }
  const subtitle =
    isCurrent && record.week != null
      ? Translate_format("{program} · Week {week}", { program: record.programName, week: record.week })
      : record.programName;
  return { title: record.dayName, subtitle };
}

const SET_VARIABLES: Record<string, string> = {
  weights: "Set {n} weight",
  reps: "Set {n} reps",
  minReps: "Set {n} min reps",
  RPE: "Set {n} RPE",
  timers: "Set {n} rest",
};

export function PersonalFormat_variableLabel(key: string): string {
  if (Language_current() !== "ja") {
    return key;
  }
  const match = key.match(/^(\w+)\[(\d+)\]$/);
  const template = match != null ? SET_VARIABLES[match[1]] : undefined;
  return template != null && match != null ? Translate_format(template, { n: match[2] }) : key;
}

export function PersonalFormat_label(englishWithColon: string): string {
  const label = Translate_text(englishWithColon);
  return label.endsWith("：") ? label : `${label} `;
}

export function PersonalFormat_listSeparator(): string {
  return Language_current() === "ja" ? "・" : ", ";
}

export function PersonalFormat_prMark(): string {
  return Language_current() === "ja" ? " PR" : " \u{1F3C6}";
}

export function PersonalFormat_volume(weight: IWeight): string {
  const value = Math.round(weight.value * 100) / 100;
  if (Language_current() !== "ja") {
    return `${value} ${weight.unit}`;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${weight.unit}`;
}

export function PersonalFormat_statLabel(label: string): string {
  return Language_current() === "ja" ? Translate_text(label) : `${label}: `;
}
