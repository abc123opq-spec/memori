import type { JSX } from "react";
import { View } from "react-native";
import { Text } from "../primitives/text";

export function HelpPlates(): JSX.Element {
  return (
    <View>
      <Text className="pb-2 text-xl font-semibold">Settings - Equipment</Text>
      <Text className="pb-2 text-sm">
        You specify your available equipment here, and specifically - what plates and what fixed weights you have
        available.
      </Text>
      <Text className="pb-2 text-sm">
        For each equipment type (Barbell, Dumbbell, Cable, etc) you can choose whether you use fixed weight or plates.
      </Text>
      <Text className="pb-2 text-sm">
        Fixed weight means you have e.g. 4 pairs of dumbbells of weight 10lb, 15lb, 20lb and 25lb, and that's it. They
        don't have plates which you can add to the dumbbell. It's fixed weight, you cannot add weight to a dumbbell. You
        can specify pairs of dumbbells of what weight you have, and the app would use only those.
      </Text>
      <Text className="pb-2 text-sm">
        You also may have a Dumbbell with plates. It'd consist of a bar (which is e.g. 10lb), and a set of pairs of
        plates - e.g. 4x2.5lb, 2x5lb, 2x10lb, etc. So you can add and remove plates to the bar, this way getting the
        weight you need. You can specify the bar weight and what number of plates you have of what weight. The app would
        round up the weights of the exercise sets to the available plates.
      </Text>
      <Text className="pb-2 text-sm">
        Note that it only allow you to enter even number of plates, because you need to balance the bar.
      </Text>
    </View>
  );
}
