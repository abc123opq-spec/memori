export type IPersonalArtSlot = "onboarding" | "emptyHistory" | "finishDay";

export interface IPersonalArt {
  light: string;
  dark?: string;
  width: number;
  height: number;
}

export const PersonalArt_files: Partial<Record<IPersonalArtSlot, IPersonalArt>> = {
  onboarding: { light: "onboarding-plate.png", dark: "onboarding-plate-dark.png", width: 192, height: 192 },
  emptyHistory: { light: "empty-bar.png", dark: "empty-bar-dark.png", width: 300, height: 19 },
  finishDay: { light: "loaded-bar.png", dark: "loaded-bar-dark.png", width: 280, height: 72 },
};

export function PersonalArt_getFrom(
  files: Partial<Record<IPersonalArtSlot, IPersonalArt>>,
  slot: IPersonalArtSlot,
  isDark: boolean
): (IPersonalArt & { uri: string }) | undefined {
  const art = files[slot];
  if (art == null) {
    return undefined;
  }
  const file = isDark && art.dark != null ? art.dark : art.light;
  return { ...art, uri: `/images/personal/${file}` };
}

export function PersonalArt_get(slot: IPersonalArtSlot, isDark: boolean): (IPersonalArt & { uri: string }) | undefined {
  return PersonalArt_getFrom(PersonalArt_files, slot, isDark);
}
