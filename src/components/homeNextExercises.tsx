import { JSX } from "react";
import { View } from "react-native";
import { Text } from "./primitives/text";
import { IHistoryEntry, ISettings } from "../types";
import { Exercise_get } from "../models/exercise";
import { Equipment_getUnitOrDefaultForExerciseType } from "../models/equipment";
import { Weight_roundConvertTo } from "../models/weight";
import { ExerciseDisplayName_withEquipment } from "../i18n/exerciseDisplayName";
import { HistoryEntrySummary_next } from "../models/historyEntrySummary";
import { Language_current } from "../i18n/language";

interface IProps {
  entries: IHistoryEntry[];
  settings: ISettings;
}

// personal-fork: next-day rows before any history, with own testIDs so the sheet keeps the only history-entry-*
export function HomeNextExercises(props: IProps): JSX.Element {
  return (
    <View className="mt-2">
      {props.entries.map((entry, i) => {
        const exercise = Exercise_get(entry.exercise, props.settings.exercises);
        const unit = Equipment_getUnitOrDefaultForExerciseType(props.settings, exercise);
        const sets = entry.sets.map((set) => ({
          ...set,
          weight: set.weight ? Weight_roundConvertTo(set.weight, props.settings, unit, entry.exercise) : set.weight,
        }));
        const summary = HistoryEntrySummary_next(sets, props.settings.units, Language_current());
        return (
          <View
            key={i}
            testID="home-next-exercise"
            data-testid="home-next-exercise"
            className={`flex-row items-center gap-2 py-3 ${i > 0 ? "border-t border-border-neutral" : ""}`}
          >
            <View className="flex-1">
              <Text className="text-sm font-semibold">
                {ExerciseDisplayName_withEquipment(exercise, props.settings)}
              </Text>
              {summary && (
                <Text
                  noTranslate={true}
                  className="mt-1 text-sm text-text-secondary"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {summary.sets}
                  {"　"}
                  {summary.reps}
                </Text>
              )}
            </View>
            {summary?.weight != null && (
              <View className="flex-row items-baseline">
                <Text
                  noTranslate={true}
                  className="font-semibold"
                  style={{ fontSize: 17, fontVariant: ["tabular-nums"] }}
                >
                  {summary.weight}
                </Text>
                <Text noTranslate={true} className="ml-0.5 text-xs text-text-secondary">
                  {summary.unit}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
