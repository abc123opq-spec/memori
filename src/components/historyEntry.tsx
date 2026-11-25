import { ExerciseDisplayName_withEquipment } from "../i18n/exerciseDisplayName";
import { ExerciseImageUtils_isShown } from "../models/exerciseImage";
import { JSX, memo } from "react";
import { View } from "react-native";
import { Text } from "./primitives/text";
import { Equipment_getUnitOrDefaultForExerciseType } from "../models/equipment";
import { Exercise_get } from "../models/exercise";
import { Weight_roundConvertTo } from "../models/weight";
import { IHistoryEntry, ISettings } from "../types";
import { ExerciseImage } from "./exerciseImage";
import { IHistoryEntryPersonalRecords } from "../models/history";
import { HistoryRecordSetsView } from "./historyRecordSets";
import { ObjectUtils_values } from "../utils/object";
import { HistoryEntrySummary_next, HistoryEntrySummary_progress } from "../models/historyEntrySummary";
import { Language_current } from "../i18n/language";
import { PersonalFormat_prMark } from "../personal/format";

interface IHistoryEntryProps {
  entry: IHistoryEntry;
  prs?: IHistoryEntryPersonalRecords;
  isOngoing?: boolean;
  isLast?: boolean;
  isNext: boolean;
  isInProgress?: boolean;
  supersetColor?: string;
  settings: ISettings;
  showNotes: boolean;
}

export const HistoryEntryView = memo((props: IHistoryEntryProps): JSX.Element => {
  const { entry, isNext, settings, showNotes, isOngoing, isLast } = props;
  const exercise = Exercise_get(entry.exercise, settings.exercises);
  const exerciseUnit = Equipment_getUnitOrDefaultForExerciseType(settings, exercise);
  const isPr = ObjectUtils_values(props.prs || {}).some((v) => v);
  const sets = entry.sets.map((set) => ({
    ...set,
    weight:
      isNext && set.weight
        ? Weight_roundConvertTo(set.weight, props.settings, exerciseUnit, entry.exercise)
        : set.weight,
  }));
  const nextSummary = isNext ? HistoryEntrySummary_next(sets, props.settings.units, Language_current()) : undefined;
  const progressSummary =
    props.isInProgress && !isNext
      ? HistoryEntrySummary_progress(sets, props.settings.units, Language_current())
      : undefined;
  const summary = nextSummary ?? progressSummary;
  const summaryLine = nextSummary ? `${nextSummary.sets}　${nextSummary.reps}` : progressSummary?.done;
  return (
    <View data-testid="history-entry-exercise" testID="history-entry-exercise" className="flex-row items-center gap-2">
      {props.supersetColor && (
        <View
          data-testid="history-entry-superset-line"
          testID="history-entry-superset-line"
          style={{
            position: "absolute",
            left: -10,
            top: 5,
            bottom: 5,
            width: 3,
            backgroundColor: props.supersetColor,
          }}
        />
      )}
      {ExerciseImageUtils_isShown(exercise, "small", props.settings) && (
        <View
          data-testid="history-entry-exercise-img"
          testID="history-entry-exercise-img"
          className="items-center justify-center py-1 rounded-lg bg-background-image"
          style={{ minWidth: 36 }}
        >
          <ExerciseImage settings={props.settings} className="w-scaled-8" exerciseType={exercise} size="small" />
        </View>
      )}
      <View
        className={`flex-1 py-2 min-h-scaled-16 flex-row items-center ${
          !isLast
            ? `border-b ${isNext ? (isOngoing ? "border-border-cardyellow" : "border-border-cardpurple") : "border-border-neutral"}`
            : ""
        }`}
      >
        <View className="flex-row items-center w-full gap-2 min-h-scaled-8">
          <View className="flex-1 shrink" style={{ minWidth: "45%" }}>
            <Text
              data-testid="history-entry-exercise-name"
              testID="history-entry-exercise-name"
              className="text-sm font-semibold"
            >
              {ExerciseDisplayName_withEquipment(exercise, props.settings)}
              {isPr && PersonalFormat_prMark()}
            </Text>
            {showNotes && entry.notes && (
              <View>
                <Text noTranslate={true} className="mt-1 text-sm text-text-secondary">
                  {entry.notes}
                </Text>
              </View>
            )}
            {summaryLine != null && (
              <Text
                noTranslate={true}
                data-testid={nextSummary ? "history-entry-sets-next" : "history-entry-progress"}
                testID={nextSummary ? "history-entry-sets-next" : "history-entry-progress"}
                className="mt-1 text-sm text-text-secondary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {summaryLine}
              </Text>
            )}
          </View>
          {/* personal-fork: Japanese next and ongoing rows follow the instrument mock, ink only */}
          {summary ? (
            summary.weight != null && (
              <View className="flex-row items-baseline">
                <Text
                  noTranslate={true}
                  data-testid="history-entry-weight"
                  testID="history-entry-weight"
                  className="font-semibold text-text-primary"
                  style={{ fontSize: 17, fontVariant: ["tabular-nums"] }}
                >
                  {summary.weight}
                </Text>
                {summary.unit != null && (
                  <Text
                    noTranslate={true}
                    data-testid="history-entry-unit"
                    testID="history-entry-unit"
                    className="ml-0.5 text-xs text-text-secondary"
                  >
                    {summary.unit}
                  </Text>
                )}
              </View>
            )
          ) : (
            <View className="shrink">
              <HistoryRecordSetsView sets={sets} prs={props.prs} units={props.settings.units} isNext={isNext} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
});
