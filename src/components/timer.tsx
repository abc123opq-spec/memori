import { JSX } from "react";
import { View, Pressable } from "react-native";
import { Text } from "./primitives/text";
import { IconPlay } from "./icons/iconPlay";
import { IconPause } from "./icons/iconPause";
import { IIntervals } from "../types";
import { History_isPaused } from "../models/history";
import { Translate_text } from "../i18n/translate";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { useRemScale } from "../utils/useRem";
import { WorkoutElapsed } from "./workoutElapsed";
import { PersonalFormat_timerLabel } from "../personal/format";

interface IProps {
  startTime: number;
  endTime?: number;
  intervals?: IIntervals;
  onPauseResume: () => void;
}

// personal-fork: the elapsed time is the screen's headline number; pause/resume sits next to it
export function Timer(props: IProps): JSX.Element {
  const isPaused = History_isPaused(props.intervals);
  const remScale = useRemScale();
  return (
    <View>
      <Text className="text-xs text-text-secondary">{PersonalFormat_timerLabel(props.intervals)}</Text>
      <View className="flex-row items-center">
        <WorkoutElapsed
          progress={props}
          testID="workout-elapsed"
          className="font-semibold text-text-primary"
          style={{ fontSize: 28 * remScale, lineHeight: 32 * remScale }}
        />
        <Pressable
          className="items-center justify-center ml-1"
          style={{ width: 44, height: 44 }}
          accessibilityRole="button"
          accessibilityLabel={Translate_text(isPaused ? "Resume workout" : "Pause workout")}
          testID="workout-pause-resume"
          data-testid="workout-pause-resume"
          onPress={props.onPauseResume}
        >
          {isPaused ? (
            <IconPlay color={Tailwind_semantic().icon.neutral} size={18} />
          ) : (
            <IconPause color={Tailwind_semantic().icon.neutralsubtle} size={18} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
