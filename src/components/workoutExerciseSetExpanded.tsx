import type { JSX } from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { WorkoutTabStopContext } from "./workoutTabStopContext";
import { Text } from "./primitives/text";
import { Path } from "./primitives/svg";
import { Translate_format, Translate_text } from "../i18n/translate";
import { IconSvg } from "./icons/iconSvg";
import { IconEdit2 } from "./icons/iconEdit2";
import { IconBarbellPlates } from "./icons/iconBarbellPlates";
import { EquipmentLoadPicture } from "./equipmentLoadPicture";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { Subscriptions_hasSubscription } from "../utils/subscriptions";
import { LinkButton } from "./linkButton";
import { InputNumber2 } from "./inputNumber2";
import { InputWeight2 } from "./inputWeight2";
import { useRemScale } from "../utils/useRem";
import { DateUtils_formatDayMonth } from "../utils/date";
import { ActionMenu, IActionMenuAction } from "./actionMenu";
import type { IWorkoutExerciseSetBodyProps } from "./workoutExerciseSet";
import {
  RpeWeightHint,
  WorkoutExerciseLastSet,
  WorkoutExerciseSetRpeTime,
  WorkoutExerciseSetTargetField,
  WorkoutExerciseSet_dataCy,
} from "./workoutExerciseSetFields";

const UNILATERAL_WEIGHT_FLEX = 1.4;

// personal-fork: the live set is one accent-soft block: label row, inputs with the accent button, plates in words
export function WorkoutExerciseSetExpanded(props: IWorkoutExerciseSetBodyProps): JSX.Element {
  const { set, isUnilateral, columnWidths, onEditTarget, onLongPressSet, onDeleteSet } = props;
  const onTargetPress = props.isRoundedWeight ? props.onOpenRoundingInfo : props.onToggleExpand;
  const actions = useMemo<IActionMenuAction[]>(() => {
    const list: IActionMenuAction[] = [];
    if (onEditTarget) {
      list.push({ label: "Edit Target", onPress: onEditTarget, testID: "edit-set-target" });
    }
    list.push({ label: "Delete Set", onPress: onDeleteSet, destructive: true, testID: "delete-set" });
    return list;
  }, [onEditTarget, onDeleteSet]);
  const previousLines = props.previousLines ?? [];
  const isSubscribed = props.subscription != null && Subscriptions_hasSubscription(props.subscription);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { onMenuOpenChange } = props;
  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpen(isOpen);
      onMenuOpenChange?.(isOpen);
    },
    [onMenuOpenChange]
  );
  const menuZIndex = Platform.OS === "web" && isMenuOpen ? { zIndex: 50 } : undefined;
  const tabIndex = useContext(WorkoutTabStopContext);
  const accentLabel = Tailwind_semantic().button.accentlabel;
  const liveButtonSize = 68 * useRemScale();
  const liveButtonStyle = { width: liveButtonSize, height: liveButtonSize };
  const isToggleDisabled = props.onToggleExpand == null && onLongPressSet == null;

  return (
    <View
      className="bg-background-accentsoft"
      data-testid={WorkoutExerciseSet_dataCy(set)}
      testID={WorkoutExerciseSet_dataCy(set)}
      style={menuZIndex}
    >
      <View className="px-4 pt-2 border-b pb-3.5 border-border-line" style={menuZIndex}>
        <View className="flex-row items-center" style={menuZIndex}>
          <Pressable
            className="justify-center pr-3"
            style={{ minHeight: 44 }}
            disabled={isToggleDisabled}
            onPress={props.onToggleExpand}
            onLongPress={onLongPressSet}
          >
            <Text noTranslate={true} className="text-sm font-semibold text-text-accent">
              {props.type === "warmup" ? "W" : Translate_format("Set {n}", { n: props.setIndex + 1 })}
            </Text>
          </Pressable>
          <Pressable
            className="flex-row items-center flex-1"
            style={{ minHeight: 44 }}
            data-testid="workout-set-row-head"
            testID="workout-set-row-head"
            disabled={onTargetPress == null && onLongPressSet == null}
            onPress={onTargetPress}
            onLongPress={onLongPressSet}
          >
            <View className="flex-1" data-testid="workout-set-target" testID="workout-set-target">
              <WorkoutExerciseSetTargetField
                set={set}
                lastSet={props.lastSet}
                setType={props.setType}
                settings={props.settings}
                exerciseType={props.exerciseType}
                underlineRounded={props.isRoundedWeight}
                sizeClass="text-sm"
                dimIncomplete={false}
              />
            </View>
          </Pressable>
          {previousLines.length === 0 && (
            <Text noTranslate={true} className="text-sm text-text-secondary">
              {Translate_text("Previous")} —
            </Text>
          )}
          <ActionMenu
            renderTrigger={(open) => (
              <Pressable
                data-testid="set-options"
                testID="set-options"
                className="items-center justify-center"
                style={{ width: 44, height: 44, marginRight: -12 }}
                onPress={open}
              >
                <IconEdit2 />
              </Pressable>
            )}
            actions={actions}
            onOpenChange={onOpenChange}
          />
        </View>

        <View className="flex-row items-center gap-2 mt-1">
          {isUnilateral ? (
            <>
              <Text className="text-xs text-text-secondary">L</Text>
              <InputNumber2
                size="xl"
                fill={true}
                tabIndex={tabIndex}
                tabStop={true}
                name="set-left-reps"
                cornerLabel={Translate_text("reps", "workout")}
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
              <Text className="text-xs text-text-secondary">R</Text>
              <InputNumber2
                size="xl"
                fill={true}
                tabIndex={tabIndex}
                tabStop={true}
                name="set-reps"
                cornerLabel={Translate_text("reps", "workout")}
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
            </>
          ) : (
            <InputNumber2
              size="xl"
              fill={true}
              tabIndex={tabIndex}
              tabStop={true}
              name="set-reps"
              cornerLabel={Translate_text("reps", "workout")}
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
          )}
          <Text className="text-lg text-text-secondarysubtle">×</Text>
          <InputWeight2
            size="xl"
            fill={true}
            fillFlex={isUnilateral ? UNILATERAL_WEIGHT_FLEX : 1}
            tabIndex={tabIndex}
            tabStop={true}
            name="set-weight"
            showUnitInCorner={true}
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
          {columnWidths.rpe > 0 ? (
            <WorkoutExerciseSetRpeTime
              set={set}
              isUnilateral={isUnilateral}
              completedRpeValue={props.completedRpeValue}
              sizeClass="text-lg"
              onEditSetTimer={props.onEditSetTimer}
            />
          ) : null}
          {props.type === "workout" && set.setTimer != null && !set.isCompleted ? (
            <Pressable
              tabIndex={tabIndex}
              dataSet={{ tabStop: "1" }}
              className="items-center justify-center rounded-lg bg-button-accentbackground"
              style={liveButtonStyle}
              accessibilityRole="button"
              accessibilityLabel={Translate_text("Start set timer")}
              data-testid="start-set-timer"
              testID="start-set-timer"
              onPress={props.onCompleteSet}
            >
              <IconSvg width={24} height={24} viewBox="0 0 20 20" fill="none">
                <Path d="M7 5L15 10L7 15V5Z" fill={accentLabel} />
              </IconSvg>
            </Pressable>
          ) : (
            <Pressable
              tabIndex={tabIndex}
              dataSet={{ tabStop: "1" }}
              className="items-center justify-center rounded-lg bg-button-accentbackground"
              style={liveButtonStyle}
              accessibilityRole="button"
              accessibilityLabel={Translate_text("Complete set")}
              data-testid="complete-set"
              testID="complete-set"
              onPress={props.onCompleteSet}
            >
              <IconSvg width={28} height={28} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M15 6.5L8.5 13.5L5 10"
                  stroke={accentLabel}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </IconSvg>
            </Pressable>
          )}
        </View>

        {props.platesLine && (
          <Pressable
            className="flex-row items-center mt-2.5"
            style={{ gap: 12 }}
            testID="set-plates"
            disabled={isToggleDisabled}
            onPress={props.onToggleExpand}
            onLongPress={onLongPressSet}
          >
            <Text noTranslate={true} className="flex-1 text-sm text-text-secondary">
              {props.platesText ?? ""}
            </Text>
            {isSubscribed ? (
              <View className="w-scaled-24">
                <EquipmentLoadPicture
                  picture={props.platesLine}
                  size="sm"
                  testID="set-plates-list"
                  highlightMismatch={true}
                />
              </View>
            ) : (
              <>
                <IconBarbellPlates size={17} />
                <LinkButton name="see-plates-for-each-side" className="text-xs" onClick={props.onOpenSubscription}>
                  See plates for each side
                </LinkButton>
              </>
            )}
          </Pressable>
        )}

        {previousLines.length > 0 && (
          <Pressable
            className="mt-2"
            testID="set-previous-lines"
            disabled={isToggleDisabled}
            onPress={props.onToggleExpand}
            onLongPress={onLongPressSet}
          >
            {previousLines.map((line) => (
              <View key={line.label} className="flex-row flex-wrap items-center gap-1">
                <Text className="text-sm text-text-secondary">{line.label}:</Text>
                <WorkoutExerciseLastSet set={line.set} sizeClass="text-sm" />
                <Text className="text-sm text-text-secondary">· {DateUtils_formatDayMonth(line.timestamp)}</Text>
              </View>
            ))}
          </Pressable>
        )}
        {props.footer != null && <View>{props.footer}</View>}
      </View>
    </View>
  );
}
