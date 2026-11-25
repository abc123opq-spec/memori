import type { JSX } from "react";
import { View } from "react-native";
import { Text } from "./primitives/text";
import { PersonalArtImage } from "../personal/personalArtImage";

export function HistoryRecordsNullState(): JSX.Element {
  return (
    <View className="items-center mt-8">
      {/* personal-fork: mascot removed, art slot in src/personal/art.ts; the start button sits above, so no arrow */}
      <PersonalArtImage slot="emptyHistory" />
      <View className="items-center w-full px-4 pt-6 mt-2 border-t border-border-line">
        <Text className="text-base font-semibold">Welcome to Memori!</Text>
        <Text className="mt-1 text-sm text-center text-text-secondary">Finished workouts will appear here.</Text>
      </View>
    </View>
  );
}
