import type { JSX } from "react";
import { View } from "react-native";
import { Text } from "../primitives/text";
import { IconCog2 } from "../icons/iconCog2";

export function HelpWorkout(): JSX.Element {
  return (
    <View>
      <Text className="pb-2 text-xl font-semibold">Workout Screen</Text>
      <Text className="pb-2 text-sm">This is where all your exercises for the current workout are.</Text>
      <Text className="pb-2 text-sm">
        You have to finish all the exercises' sets and reps. Each time you finish a set, you tap on a square to record
        it. By tapping on it again you can lower the number of reps you did.
      </Text>
      <Text className="pb-2 text-sm">
        Some reps have + in it (like 5+). That is AMRAP - As Many Reps As Possible. You should strive to do as many reps
        as you can there, but if you do less than the number on the square, it's considered as an unsuccessful set.
      </Text>
      <Text className="pb-2 text-sm">
        In the Plates for each bar side section, you can see all the weights you use for that exercise, and the plates
        you have to put on each side of the bar to get that weight. E.g. 185lb - 45/25 means that to get 185lb you need
        to put one 45lb and one 25lb plate on each side of the bar. By tapping on the weights there you can change them
        for that workout. It won't change the weight in the program though, only for that workout.
      </Text>
      <View className="flex-row flex-wrap items-center pb-2">
        <Text className="text-sm">
          Note that it only will use the available plates in the plates calculator, and it will round up the weights to
          available plates. Set up what plates you have in the Settings screen (bottom right corner, the{" "}
        </Text>
        <IconCog2 size={14} />
        <Text className="text-sm"> icon).</Text>
      </View>
      <Text className="pb-2 text-sm">
        The order of doing exercises and sets is not important, the app doesn't enforce it at all. You can do
        "supersets", i.e. simultaneously going through e.g. 2 exercises one after another, without rest period, to save
        time in gym.
      </Text>
      <Text className="text-sm">
        After you've done all the sets for an exercise, the "Finish Day Script" for that exercise will be run. It may
        increase or decrease weight or reps, depending on the logic defined in the program for that exercise. If there
        are any changes applied, you'll see that under the exercise, in the Exercise State Variables changes block.
      </Text>
    </View>
  );
}
