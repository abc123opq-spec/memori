import type { JSX } from "react";
import { View } from "react-native";
import { Text } from "../primitives/text";

export function HelpMusclesDay(): JSX.Element {
  return (
    <View>
      <Text className="pb-2 text-xl font-semibold">Muscles Map - Day</Text>
      <Text className="pb-2 text-sm">
        Shows how much specific muscles are used in the current day. You may use it to find imbalances in your program.
      </Text>
      <Text className="pb-2 text-sm">
        {
          "We calculate usage for strength and hypertrophy separately. For strength we consider sets with reps < 8, for hypertrophy - sets with reps >= 8."
        }
      </Text>
      <Text className="pb-2 text-sm">
        In the Muscles used, relatively to each other section, for calculating percentages, we assume each target muscle
        is 3x of each synergist muscle, we combine all sets and reps, and then normalize by the most used muscle - it
        will be 100%. So all other muscles would be less than 100%.
      </Text>
      <Text className="pb-2 text-sm">
        In the List of exercises section, you could see the muscles for each exercise, split into target and synergist.
        It also shows the same numbers as above - how much each muscle is used in the day relatively to the top muscle.
      </Text>
    </View>
  );
}
