import { JSX, memo, MutableRefObject, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives/text";
import type RB from "rollbar";
import { IDispatch } from "../ducks/types";
import { IHistoryRecord, ISettings } from "../types";
import { Button } from "./button";
import { IconSpinner } from "./icons/iconSpinner";
import { Tailwind_colors, Tailwind_semantic } from "../utils/tailwindConfig";
import { Dialog_alert } from "../utils/dialog";
import { Translate_text } from "../i18n/translate";
import { WorkoutFinish_run } from "../utils/workoutFinish";

declare let Rollbar: RB | undefined;

interface IWorkoutFinishButtonProps {
  progressRef: MutableRefObject<IHistoryRecord>;
  isCurrent: boolean;
  settings: ISettings;
  dispatch: IDispatch;
}

function WorkoutFinishButtonInner(props: IWorkoutFinishButtonProps): JSX.Element {
  const isCurrent = props.isCurrent;
  const [isFinishing, setIsFinishing] = useState(false);
  const onPress = (): void => {
    if (isFinishing) {
      return;
    }
    WorkoutFinish_run({
      progress: props.progressRef.current,
      settings: props.settings,
      dispatch: props.dispatch,
      isCurrent,
      setIsFinishing,
    }).catch((error) => {
      if (typeof Rollbar !== "undefined" && Rollbar != null) {
        Rollbar.error(error instanceof Error ? error : new Error(String(error)));
      }
      Dialog_alert(Translate_text("Something went wrong finishing your workout. Please try again."));
    });
  };
  if (isCurrent) {
    // personal-fork: a quiet surface button, so the accent stays on the live set
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isFinishing}
        data-testid="finish-workout"
        testID="finish-workout"
        className="items-center justify-center px-4 rounded-lg ls-finish-workout h-11 bg-background-surface"
        style={{ minWidth: 64 }}
        onPress={onPress}
      >
        {isFinishing ? (
          <IconSpinner width={20} height={20} color={Tailwind_semantic().icon.neutral} />
        ) : (
          <Text className="text-base font-semibold text-text-primary">Finish</Text>
        )}
      </Pressable>
    );
  }
  return (
    <Button
      name="save-history-record"
      kind="purple"
      buttonSize="md"
      disabled={isFinishing}
      data-testid="finish-workout"
      testID="finish-workout"
      className="ls-save-history-record"
      onClick={onPress}
    >
      {isFinishing ? (
        <View className="px-2">
          <IconSpinner width={20} height={20} color={Tailwind_colors().white} />
        </View>
      ) : (
        "Save"
      )}
    </Button>
  );
}

export const WorkoutFinishButton = memo(WorkoutFinishButtonInner);
