import { JSX, memo, useCallback } from "react";
import { View } from "react-native";
import { Pressable } from "./primitives/pressable";
import { Text } from "./primitives/text";
import { Exercise_get } from "../models/exercise";
import { IHistoryEntry, ISettings } from "../types";
import { StringUtils_dashcase } from "../utils/string";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { ObjectUtils_entries } from "../utils/object";
import { ExerciseDisplayName_name } from "../i18n/exerciseDisplayName";

interface IWorkoutExerciseThumbnailProps {
  onSelect?: (entryIndex: number) => void;
  colorToSupersetGroup: Partial<Record<string, IHistoryEntry[]>>;
  isCurrent: boolean;
  currentSuperset?: string;
  shouldShowProgress?: boolean;
  entry: IHistoryEntry;
  entryIndex: number;
  settings: ISettings;
}

const MAX_TICKS = 4;

// personal-fork: a text tab with "done/total" and one tick per set, no exercise picture
function WorkoutExerciseThumbnailInner(props: IWorkoutExerciseThumbnailProps): JSX.Element {
  const { entry, entryIndex, isCurrent, currentSuperset, onSelect } = props;
  const onPress = useCallback(() => onSelect?.(entryIndex), [onSelect, entryIndex]);
  const hasSupersets = Object.keys(props.colorToSupersetGroup).length > 0;
  const colorAndSupersetGroup = ObjectUtils_entries(props.colorToSupersetGroup).find(([_, entries]) => {
    return entries && entries.some((e) => e.id === entry.id);
  });
  const supersetColor = colorAndSupersetGroup ? colorAndSupersetGroup[0] : undefined;
  const isCurrentSuperset = currentSuperset != null && currentSuperset === entry.superset;
  const exercise = Exercise_get(entry.exercise, props.settings.exercises);
  const totalSetsCount = entry.sets.length;
  const completedSetsCount = entry.sets.filter((set) => set.isCompleted).length;

  const tile = (
    <View
      data-name={`workout-exercise-tab-${entryIndex}`}
      testID={`workout-tab-${StringUtils_dashcase(exercise.name)}`}
      data-testid={`workout-tab-${StringUtils_dashcase(exercise.name)}`}
      dataSet={{ isSelected: isCurrent ? "true" : "false" }}
      className={`min-w-scaled-24 rounded-lg border px-2.5 pt-1.5 pb-2 ${isCurrent ? "bg-background-default border-border-line dark:bg-background-surface2 dark:border-transparent" : "border-transparent"}`}
      style={{ minHeight: 56, maxWidth: 180 }}
    >
      {/* personal-fork: the tab widens to show the whole name, up to 180px */}
      <Text
        numberOfLines={1}
        className={`text-xs ${isCurrent ? "font-semibold text-text-primary" : "text-text-secondary"}`}
      >
        {ExerciseDisplayName_name(exercise)}
      </Text>
      {props.shouldShowProgress && (
        <View className="flex-row items-center justify-between mt-1">
          <Text noTranslate={true} className="text-base font-semibold text-text-primary">
            {completedSetsCount}/{totalSetsCount}
          </Text>
          {totalSetsCount <= MAX_TICKS && (
            <View className="flex-row" style={{ gap: 3 }}>
              {entry.sets.map((set, i) => (
                <View
                  key={i}
                  style={{
                    width: 10,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: set.isCompleted
                      ? Tailwind_semantic().text.primary
                      : Tailwind_semantic().border.control,
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
  return (
    <View>
      {onSelect ? <Pressable onPress={onPress}>{tile}</Pressable> : tile}
      {supersetColor ? (
        <View className="mx-1">
          <View
            className="w-full"
            style={{
              backgroundColor: isCurrentSuperset ? supersetColor : Tailwind_semantic().background.neutral,
              height: 2,
              marginTop: 5,
            }}
          />
        </View>
      ) : hasSupersets ? (
        <View className="w-full" style={{ backgroundColor: "transparent", height: 2, marginTop: 5 }} />
      ) : null}
    </View>
  );
}

export const WorkoutExerciseThumbnail = memo(WorkoutExerciseThumbnailInner);
