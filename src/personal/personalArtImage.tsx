import type { JSX } from "react";
import { Image, View } from "react-native";
import { IPersonalArtSlot, PersonalArt_get } from "./art";
import { Tailwind_isDark } from "../utils/tailwindConfig";
import { HostConfig_resolveUrl } from "../utils/hostConfig";

interface IProps {
  slot: IPersonalArtSlot;
  className?: string;
  isDark?: boolean;
}

export function PersonalArtImage(props: IProps): JSX.Element | null {
  const art = PersonalArt_get(props.slot, props.isDark ?? Tailwind_isDark());
  if (art == null) {
    return null;
  }
  return (
    <View className={props.className} importantForAccessibility="no-hide-descendants" aria-hidden={true}>
      <Image
        source={{ uri: HostConfig_resolveUrl(art.uri) }}
        style={{ width: art.width, height: art.height }}
        resizeMode="contain"
      />
    </View>
  );
}
