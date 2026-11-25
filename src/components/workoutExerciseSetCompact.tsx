import type { JSX } from "react";
import { useContext } from "react";
import { View, Pressable } from "react-native";
import { WorkoutTabStopContext } from "./workoutTabStopContext";
import { Text } from "./primitives/text";
import { IconCheckCircle } from "./icons/iconCheckCircle";
import { IconPlayCircle } from "./icons/iconPlayCircle";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { InputNumber2 } from "./inputNumber2";
import { InputWeight2 } from "./inputWeight2";
import type { IWorkoutExerciseSetBodyProps } from "./workoutExerciseSet";
import {
  RpeWeightHint,
  WorkoutExerciseSetRpeTime,
  WorkoutExerciseSetTargetField,
  WorkoutExerciseSet_dataCy,
} from "./workoutExerciseSetFields";

export function WorkoutExerciseSetCompact(props: IWorkoutExerciseSetBodyProps): JSX.Element {
  const { set, isUnilateral, labelW, columnWidths } = props;
  const onTargetPress = props.onToggleExpand ?? (props.isRoundedWeight ? props.onOpenRoundingInfo : undefined);
  const tabIndex = useContext(WorkoutTabStopContext);
  return (
    <View data-testid={WorkoutExerciseSet_dataCy(set)} testID={WorkoutExerciseSet_dataCy(set)}>
      {/* personal-fork: plain row on the ground, 1px line, ink check */}
      <View className="border-b border-border-line">
        <View className="flex-row items-center" style={{ minHeight: 56 }}>
          <Pressable
            className="flex-row items-center flex-1"
            data-testid="workout-set-row-head"
            testID="workout-set-row-head"
            disabled={onTargetPress == null && props.onLongPressSet == null}
            onPress={onTargetPress}
            onLongPress={props.onLongPressSet}
          >
            <View className="items-center justify-center py-1" style={{ width: columnWidths.set }}>
              <Text
                className={`${props.type === "warmup" ? "text-xs" : "text-base"} ${props.isNext ? "font-semibold text-text-accent" : "text-text-secondary"}`}
              >
                {props.type === "warmup" ? "W" : props.setIndex + 1}
              </Text>
            </View>
            <View className="flex-1" data-testid="workout-set-target" testID="workout-set-target">
              <WorkoutExerciseSetTargetField
                set={set}
                lastSet={props.lastSet}
                setType={props.setType}
                settings={props.settings}
                exerciseType={props.exerciseType}
                underlineRounded={props.isRoundedWeight}
              />
            </View>
          </Pressable>

          <View className="items-center justify-center py-2" style={{ width: columnWidths.reps }}>
            {isUnilateral && (
              <View className="flex-row items-center justify-center mb-1">
                <Text className="text-xs text-text-secondary" style={{ width: labelW }}>
                  L:
                </Text>
                <InputNumber2
                  width={props.repsInputWidth}
                  tabIndex={tabIndex}
                  tabStop={true}
                  name="set-left-reps"
                  onInput={props.onInputLeftReps}
                  onBlur={props.onBlurLeftReps}
                  placeholder={props.placeholderReps}
                  initialValue={set.reps}
                  value={set.completedRepsLeft != null ? set.completedRepsLeft : undefined}
                  min={0}
                  max={9999}
                  step={1}
                  inputCommitMode="blur"
                />
              </View>
            )}
            <View className="flex-row items-center justify-center">
              {isUnilateral && (
                <Text className="text-xs text-text-secondary" style={{ width: labelW }}>
                  R:
                </Text>
              )}
              <InputNumber2
                width={props.repsInputWidth}
                tabIndex={tabIndex}
                tabStop={true}
                name="set-reps"
                onInput={props.onInputReps}
                onBlur={props.onBlurReps}
                placeholder={props.placeholderReps}
                initialValue={set.reps}
                value={set.completedReps != null ? set.completedReps : undefined}
                min={0}
                max={9999}
                step={1}
                inputCommitMode="blur"
              />
            </View>
          </View>
          <View className="items-center justify-center py-2" style={{ width: columnWidths.separator }}>
            <Text className="text-text-secondary">×</Text>
          </View>
          <View className="items-start justify-center py-2" style={{ width: columnWidths.weight }}>
            <InputWeight2
              width={props.weightInputWidth}
              tabIndex={tabIndex}
              tabStop={true}
              name="set-weight"
              exerciseType={props.exerciseType}
              inputCommitMode="blur"
              onBlur={props.onBlurWeight}
              onInput={props.onInputWeight}
              addOn={
                set.rpe != null && set.reps != null
                  ? () => (
                      <RpeWeightHint
                        reps={set.completedReps ?? set.reps ?? 0}
                        rpe={set.completedRpe ?? set.rpe!}
                        settings={props.settings}
                        exerciseType={props.exerciseType}
                      />
                    )
                  : undefined
              }
              subscription={props.subscription}
              placeholder={props.placeholderWeight}
              initialValue={set.weight}
              value={set.completedWeight || undefined}
              max={9999}
              min={-9999}
              settings={props.settings}
            />
          </View>

          {columnWidths.rpe > 0 ? (
            <WorkoutExerciseSetRpeTime
              set={set}
              isUnilateral={isUnilateral}
              completedRpeValue={props.completedRpeValue}
              width={columnWidths.rpe}
              onEditSetTimer={props.onEditSetTimer}
            />
          ) : null}

          <View className="items-end justify-center" style={{ width: columnWidths.check }}>
            {props.type === "workout" && set.setTimer != null && !set.isCompleted ? (
              <Pressable
                tabIndex={tabIndex}
                dataSet={{ tabStop: "1" }}
                className={columnWidths.rpe > 0 ? "pr-3 py-3" : "pl-2 pr-4 py-3"}
                data-testid="start-set-timer"
                testID="start-set-timer"
                onPress={props.onCompleteSet}
              >
                <IconPlayCircle size={32} color={Tailwind_semantic().text.secondarysubtle} />
              </Pressable>
            ) : (
              <Pressable
                tabIndex={tabIndex}
                dataSet={{ tabStop: "1" }}
                className={columnWidths.rpe > 0 ? "pr-3 py-3" : "pl-2 pr-4 py-3"}
                data-testid="complete-set"
                testID="complete-set"
                onPress={props.onCompleteSet}
              >
                <IconCheckCircle
                  size={32}
                  isChecked={!!set.isCompleted}
                  color={Tailwind_semantic().text.primary}
                  checkColor={Tailwind_semantic().background.default}
                />
              </Pressable>
            )}
          </View>
        </View>
        {props.footer != null && <View style={{ paddingLeft: columnWidths.set }}>{props.footer}</View>}
      </View>
    </View>
  );
}
