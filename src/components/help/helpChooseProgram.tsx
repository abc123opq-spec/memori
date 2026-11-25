import type { JSX } from "react";
import { View } from "react-native";
import { Text } from "../primitives/text";
import { Link } from "../link";

export function HelpChooseProgram(): JSX.Element {
  return (
    <View>
      <Text className="pb-2 text-xl font-semibold">Choose a program to clone</Text>
      <Text className="pb-2 text-sm">
        This screen lists your programs, as well as the available pre-built programs, so you can clone them.
      </Text>
      <Text className="pb-2 text-sm">
        Tapping on one of your programs selects it for the next workout. If you want to edit it or remove it, press the
        "Edit" button on the right.
      </Text>
      <Text className="pb-2 text-sm">Cloning a pre-built means you copy the program to the list of your programs.</Text>
      <Text className="pb-2 text-sm">
        A program defines the list of workout days and the exercises for each day. It also defines the logic for
        increasing or decreasing reps and weights over time, depending on your workout performance.
      </Text>
      <Text className="pb-2 text-sm">
        After you clone a program, you can modify it in any way you want. The app is very flexible, you can change the
        reps/weights logic, using a special scripting language called{" "}
        <Link className="text-sm" href="/doc">
          Liftoscript
        </Link>
      </Text>
    </View>
  );
}
