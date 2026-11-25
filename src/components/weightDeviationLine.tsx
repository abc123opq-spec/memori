import type { JSX } from "react";
import { Pressable } from "react-native";
import { Text } from "./primitives/text";
import { IWeightDeviation } from "../models/weightDeviation";
import { Weight_display } from "../models/weight";
import { Translate_format } from "../i18n/translate";

export function WeightDeviationLine(props: { deviation: IWeightDeviation; onPress: () => void }): JSX.Element {
  const { completedWeight, targetWeight } = props.deviation;
  return (
    <Pressable
      className="flex-row justify-end pb-2 pr-4"
      onPress={props.onPress}
      testID="weight-deviation-update-program"
      data-testid="weight-deviation-update-program"
    >
      <Text className="text-xs text-text-secondary">
        {Translate_format("{completed} instead of {target} ·", {
          completed: Weight_display(completedWeight),
          target: Weight_display(targetWeight),
        })}{" "}
      </Text>
      <Text className="text-xs font-semibold text-text-link">Update program…</Text>
    </Pressable>
  );
}
