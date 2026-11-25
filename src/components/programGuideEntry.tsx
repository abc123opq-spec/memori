import { JSX } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives/text";
import { IProgram } from "../types";
import { useAppState } from "../navigation/StateContext";
import { navigateToModal } from "../navigation/navigationService";
import { ProgramGuide_builtinId } from "../models/programGuide";

interface IProps {
  program: IProgram;
  testID: string;
  label: "Full description and FAQ" | "Read description";
  isCard?: boolean;
}

// personal-fork: entry to the in-app program guide, shown only when the program maps to a built-in one
export function ProgramGuideEntry(props: IProps): JSX.Element | null {
  const { state } = useAppState();
  const builtinId = ProgramGuide_builtinId(props.program, state.programsIndex);
  if (!builtinId || !state.programGuides[builtinId]) {
    return null;
  }
  const onPress = (): void => navigateToModal("programGuideModal", { programId: props.program.id });
  if (props.isCard) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        testID={props.testID}
        data-testid={props.testID}
        className="flex-row items-center w-full px-4 border rounded-lg border-border-line bg-background-surface"
        style={{ minHeight: 48 }}
      >
        <Text className="flex-1 text-sm font-semibold">{props.label}</Text>
        <Text noTranslate={true} className="pl-3 text-lg text-text-secondary">
          ›
        </Text>
      </Pressable>
    );
  }
  return (
    <View className="flex-row">
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        testID={props.testID}
        data-testid={props.testID}
        className="justify-center"
        style={{ minHeight: 44 }}
      >
        <Text className="text-sm font-semibold underline text-text-link">{props.label}</Text>
      </Pressable>
    </View>
  );
}
