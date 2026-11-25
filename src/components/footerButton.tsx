import type { JSX } from "react";
import { View, Pressable, TextStyle } from "react-native";
import { Text } from "./primitives/text";
import { ITab } from "../models/screen";
import { StringUtils_dashcase } from "../utils/string";
import { useRemScale } from "../utils/useRem";

export interface IProps {
  name: ITab;
  icon: (isActive: boolean) => JSX.Element;
  currentTab: ITab;
  hasDot?: boolean;
  text: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function FooterButton_labelStyle(remScale: number): TextStyle {
  return { fontSize: 11 * remScale, lineHeight: 14 * remScale };
}

// personal-fork: 50px tab with a 24px line icon; the selected tab is ink and semibold, the others ink3
export function FooterButton(props: IProps): JSX.Element {
  const isActive = props.name === props.currentTab;
  const dataCy = `footer-${StringUtils_dashcase(props.text)}`;
  const remScale = useRemScale();
  return (
    <Pressable
      className="items-center justify-center flex-1 px-0.5"
      style={{ minHeight: 50 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      data-testid={dataCy}
      testID={dataCy}
      onPress={isActive ? undefined : props.onClick}
    >
      <View className="relative flex-row items-center justify-center" style={{ width: 24, height: 24 }}>
        {props.icon(isActive)}
        {props.hasDot && (
          <View className="absolute w-2 h-2 rounded-full bg-background-error" style={{ top: -1, right: -1 }} />
        )}
      </View>
      <Text
        numberOfLines={1}
        className={`pt-0.5 ${isActive ? "font-semibold text-text-primary" : "font-medium text-text-ink3"}`}
        style={FooterButton_labelStyle(remScale)}
      >
        {props.text}
      </Text>
    </Pressable>
  );
}
