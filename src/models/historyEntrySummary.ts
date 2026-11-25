import { ILanguage } from "../i18n/language";
import { Translate_format, Translate_text } from "../i18n/translate";
import { ISet, IUnit } from "../types";
import { Reps_setToDisplaySet } from "./set";

export interface IHistoryEntryNextSummary {
  sets: string;
  reps: string;
  weight?: string;
  unit?: string;
}

function load(weight: string | undefined, unit: string | undefined): { weight?: string; unit?: string } {
  if (weight == null) {
    return {};
  }
  return weight === "0" ? { weight: Translate_text("Bodyweight", "load") } : { weight, unit };
}

export function HistoryEntrySummary_next(
  sets: ISet[],
  units: IUnit,
  language: ILanguage
): IHistoryEntryNextSummary | undefined {
  if (language !== "ja" || sets.length === 0) {
    return undefined;
  }
  const display = sets.map((s) => Reps_setToDisplaySet(s, true, units));
  const first = display[0];
  const isPlain = display.every(
    (d) =>
      d.weight === first.weight &&
      d.unit === first.unit &&
      !d.askWeight &&
      d.rpe == null &&
      d.timer == null &&
      d.setTimer == null &&
      !d.auto
  );
  if (!isPlain) {
    return undefined;
  }
  return {
    sets: Translate_format("{n} Sets", { n: sets.length }),
    reps: Translate_format("{reps} reps", { reps: display.map((d) => d.reps).join("・") }),
    ...load(first.weight, first.unit),
  };
}

export function HistoryEntrySummary_progress(
  sets: ISet[],
  units: IUnit,
  language: ILanguage
): { done: string; weight?: string; unit?: string } | undefined {
  if (language !== "ja" || sets.length === 0) {
    return undefined;
  }
  const done = Translate_format("Done {done}/{total}", {
    done: sets.filter((s) => s.isCompleted).length,
    total: sets.length,
  });
  const display = sets.map((s) => Reps_setToDisplaySet({ ...s, completedWeight: undefined }, true, units));
  const first = display[0];
  const sameWeight = display.every((d) => d.weight === first.weight && d.unit === first.unit);
  return sameWeight ? { done, ...load(first.weight, first.unit) } : { done };
}
