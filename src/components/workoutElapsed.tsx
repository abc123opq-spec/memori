import { JSX, useEffect, useState } from "react";
import { TextStyle } from "react-native";
import { Text } from "./primitives/text";
import { IHistoryRecord } from "../types";
import { History_workoutTime } from "../models/history";
import { WorkoutElapsedText_format } from "../utils/workoutElapsedText";

interface IWorkoutElapsedProps {
  progress: Pick<IHistoryRecord, "startTime" | "endTime" | "intervals">;
  className?: string;
  style?: TextStyle;
  testID?: string;
}

export function WorkoutElapsed(props: IWorkoutElapsedProps): JSX.Element {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Text
      noTranslate={true}
      numberOfLines={1}
      testID={props.testID}
      data-testid={props.testID}
      className={props.className}
      style={[{ fontVariant: ["tabular-nums"] }, props.style]}
    >
      {WorkoutElapsedText_format(History_workoutTime(props.progress))}
    </Text>
  );
}
