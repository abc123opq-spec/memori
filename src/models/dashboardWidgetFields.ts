import { IAllCustomExercises, IExerciseType, ISettings } from "../types";
import { Exercise_resolveNameAndEquipmentParts } from "./exercise";
import { Muscle_getAvailableMuscleGroups, Muscle_getMuscleGroupName } from "./muscle";
import { ILiftographAtom, ILiftographValue, LiftographDocument_parse } from "../liftograph/liftographDocument";
import { ILiftographAgg, LiftographCompile_duration } from "../liftograph/liftographCompile";
import { ILiftographPresetName } from "../liftograph/liftographPresets";
import { LiftographScriptSyntax_pointArity } from "../liftograph/liftographScriptSyntax";
import { parser as liftoscriptParser } from "../liftoscript";
import {
  ILiftographModelAgg,
  ILiftographModelDay,
  ILiftographModelSeries,
  ILiftographModelSource,
  ILiftographWidgetModel,
  LiftographWidgetModel_defaultPreset,
} from "../liftograph/liftographWidgetModel";
import { ILiftographModelAggField, LiftographWidgetEdit_seriesAt } from "../liftograph/liftographWidgetEdit";
import { Translate_format, Translate_text } from "../i18n/translate";
import { Language_current } from "../i18n/language";
import { ExerciseDisplayName_equipmentSuffix, ExerciseDisplayName_name } from "../i18n/exerciseDisplayName";

export type IDashboardValueField = "compare" | "trend";

const VALUE_DURATIONS: Record<IDashboardValueField, string[]> = {
  compare: ["1w", "4w", "3m", "1y"],
  trend: ["4w", "3m", "6m", "1y"],
};

const WINDOWS: Record<ILiftographModelAggField, string[]> = {
  group: ["1w", "2w", "1m", "3m"],
  smooth: ["3", "5", "10", "30d"],
};

const AGG_WORDS: Record<ILiftographAgg, string> = {
  max: "the max",
  min: "the min",
  sum: "the sum",
  avg: "the average",
  last: "the last value",
  count: "the count",
};

const UNIT_WORDS: Record<"d" | "w" | "m" | "y", string> = { d: "day", w: "week", m: "month", y: "year" };

const COUNTED_UNITS: Record<"d" | "w" | "m" | "y", { one: string; many: string }> = {
  d: { one: "1 day", many: "{n} days" },
  w: { one: "1 week", many: "{n} weeks" },
  m: { one: "1 month", many: "{n} months" },
  y: { one: "1 year", many: "{n} years" },
};

const PRESET_LABELS: Record<ILiftographPresetName, string> = {
  maxWeight: "Max weight",
  e1rm: "e1RM",
  volume: "Volume",
  maxReps: "Max reps",
  muscleSets: "Sets per muscle",
  muscleVolume: "Volume per muscle",
  duration: "Duration",
  value: "Value",
};

function singleAtom(value: ILiftographValue | undefined): ILiftographAtom | undefined {
  return value?.type === "atoms" && value.atoms.length === 1 ? value.atoms[0] : undefined;
}

function probeAtom(key: string, text: string): ILiftographAtom | undefined {
  const probe = LiftographDocument_parse(`value / ${key}: ${text}`).items[0];
  const pairs = probe?.type === "widget" ? probe.pairs : [];
  return pairs.length === 1 ? singleAtom(pairs[0]?.value) : undefined;
}

function periodWords(window: string, isCounted: boolean = false): string {
  const atom = probeAtom("w", window);
  const duration = atom != null ? LiftographCompile_duration(atom) : undefined;
  if (duration == null || duration === "all") {
    return window;
  }
  const unit = UNIT_WORDS[duration.unit];
  const counted = COUNTED_UNITS[duration.unit];
  if (duration.n === 1) {
    return isCounted ? Translate_text(counted.one) : Translate_text(unit, "period");
  }
  return Translate_format(counted.many, { n: duration.n });
}

export function DashboardWidgetFields_durations(field: IDashboardValueField): string[] {
  return VALUE_DURATIONS[field];
}

export function DashboardWidgetFields_isCustom(options: string[], value: string | undefined): boolean {
  return value != null && options.indexOf(value) === -1;
}

export function DashboardWidgetFields_valueHint(field: IDashboardValueField, duration: string | undefined): string {
  if (field === "compare") {
    return duration == null
      ? Translate_text("Shows only the current value.")
      : Translate_format('Shows the change since {period} ago, like "▲ 7.5 {vs}".', {
          period: periodWords(duration, true),
          vs: Translate_format("vs {duration}", { duration }),
        });
  }
  return duration == null
    ? Translate_text("No small chart under the number.")
    : Translate_format("Draws a small chart of the last {period} under the number.", {
        period: periodWords(duration, true),
      });
}

export function DashboardWidgetFields_muscleGroups(settings: ISettings, hasTotal: boolean): string[] {
  const groups = Muscle_getAvailableMuscleGroups(settings);
  return hasTotal ? ["total", ...groups] : groups;
}

export function DashboardWidgetFields_muscleGroupLabel(group: string, settings: ISettings): string {
  return group === "total" ? Translate_text("All muscles") : Muscle_getMuscleGroupName(group, settings);
}

export function DashboardWidgetFields_toggleGroup(
  groups: string[] | undefined,
  group: string,
  all: string[]
): string[] | undefined {
  const current = groups ?? [];
  if (current.indexOf(group) !== -1) {
    const removed = current.filter((g) => g !== group);
    return removed.length > 0 ? removed : undefined;
  }
  const added = [...current, group];
  return [...all.filter((g) => added.indexOf(g) !== -1), ...added.filter((g) => all.indexOf(g) === -1)];
}

export function DashboardWidgetFields_isNumeric(series: ILiftographModelSeries): boolean {
  const values = series.values;
  if (values?.type !== "script") {
    return false;
  }
  return LiftographScriptSyntax_pointArity(liftoscriptParser.parse(values.text), values.text).has(2);
}

export function DashboardWidgetFields_presetLabel(preset: ILiftographPresetName): string {
  return Translate_text(PRESET_LABELS[preset]);
}

function exerciseSourceLabel(name: string, equipment: string | undefined): string {
  const parts = equipment != null ? [name, equipment] : [name];
  const resolved = Language_current() === "ja" ? Exercise_resolveNameAndEquipmentParts(parts, {}) : undefined;
  if (resolved == null) {
    return parts.join(", ");
  }
  const exerciseEquipment = resolved.exercise.equipment;
  const base = ExerciseDisplayName_name(resolved.exercise);
  return equipment != null && exerciseEquipment != null
    ? `${base}${ExerciseDisplayName_equipmentSuffix(exerciseEquipment)}`
    : base;
}

export function DashboardWidgetFields_sourceLabel(source: ILiftographModelSource | undefined): string {
  switch (source?.type) {
    case undefined:
      return Translate_text("No source");
    case "raw":
      return source.text;
    case "stats":
      return source.key;
    case "workout":
      return Translate_text("All workouts");
    case "exercise":
      return source.name == null ? Translate_text("Any exercise") : exerciseSourceLabel(source.name, source.equipment);
  }
}

function valuesLabel(series: ILiftographModelSeries): string | undefined {
  const values = series.values;
  if (values == null) {
    const preset = LiftographWidgetModel_defaultPreset(series.source);
    return preset != null ? DashboardWidgetFields_presetLabel(preset) : undefined;
  } else if (values.type === "preset") {
    const label = DashboardWidgetFields_presetLabel(values.preset);
    return values.arg != null ? Translate_format("{label} ({arg})", { label, arg: values.arg }) : label;
  } else if (values.type === "script") {
    return Translate_text("Custom script");
  }
  return values.text;
}

function groupLabel(group: ILiftographModelAgg | undefined): string | undefined {
  if (group == null) {
    return undefined;
  } else if (group.type === "raw") {
    return group.text;
  }
  const agg = Translate_text(group.agg, "aggregate");
  return group.window != null
    ? Translate_format("{agg} per {period}", { agg, period: periodWords(group.window) })
    : agg;
}

export function DashboardWidgetFields_seriesSummary(series: ILiftographModelSeries): string {
  return [DashboardWidgetFields_sourceLabel(series.source), valuesLabel(series), groupLabel(series.group)]
    .filter((part): part is string => part != null)
    .join(" · ");
}

export function DashboardWidgetFields_dayFromText(text: string): ILiftographModelDay | undefined {
  const trimmed = text.trim();
  if (trimmed === "") {
    return undefined;
  }
  const atom = probeAtom("day", trimmed);
  const n = atom?.kind === "number" ? Number(atom.text) : undefined;
  return n != null && Number.isInteger(n) ? { type: "number", value: n } : { type: "name", value: trimmed };
}

export function DashboardWidgetFields_dayText(day: ILiftographModelDay | undefined): string {
  return day == null ? "" : `${day.value}`;
}

export function DashboardWidgetFields_textValue(text: string): string | undefined {
  return text.trim() === "" ? undefined : text;
}

export function DashboardWidgetFields_exerciseType(
  source: ILiftographModelSource | undefined,
  exercises: IAllCustomExercises
): IExerciseType | undefined {
  if (source?.type !== "exercise" || source.name == null) {
    return undefined;
  }
  const parts = source.equipment != null ? [source.name, source.equipment] : [source.name];
  const resolved = Exercise_resolveNameAndEquipmentParts(parts, exercises);
  if (resolved == null) {
    return undefined;
  }
  const equipment = resolved.exercise.equipment ?? resolved.exercise.defaultEquipment;
  return equipment != null ? { id: resolved.exercise.id, equipment } : { id: resolved.exercise.id };
}

export function DashboardWidgetFields_pickerExercise(
  model: ILiftographWidgetModel,
  entryIndex: number,
  exercises: IAllCustomExercises
): IExerciseType | undefined {
  const series = LiftographWidgetEdit_seriesAt(model, entryIndex);
  return DashboardWidgetFields_exerciseType(series?.source, exercises);
}

export function DashboardWidgetFields_windows(field: ILiftographModelAggField): string[] {
  return WINDOWS[field];
}

export function DashboardWidgetFields_splitOptions(
  options: string[],
  current: string | undefined,
  limit: number
): { visible: string[]; rest: string[] } {
  const visible = options.slice(0, limit);
  const rest = options.slice(limit).filter((option) => option !== current);
  const isHidden = current != null && visible.indexOf(current) === -1;
  return { visible: isHidden ? [...visible, current] : visible, rest };
}

export function DashboardWidgetFields_aggHint(
  field: ILiftographModelAggField,
  agg: ILiftographModelAgg | undefined
): string {
  if (agg == null) {
    return Translate_text(field === "group" ? "One point per workout." : "No smoothing, the line follows every point.");
  }
  if (agg.type === "raw") {
    return "";
  }
  const what = Translate_text(AGG_WORDS[agg.agg], "aggregate");
  if (agg.window == null) {
    return field === "group" ? Translate_format("One point per x value: {what} of the points there.", { what }) : "";
  }
  if (field === "group") {
    return Translate_format("One point per {period}: {what} of that period.", {
      period: periodWords(agg.window),
      what,
    });
  }
  const atom = probeAtom("w", agg.window);
  const last = atom?.kind === "number" ? Translate_format("{n} points", { n: atom.text }) : periodWords(agg.window);
  return Translate_format("Each point becomes {what} of the last {last}.", { what, last });
}
