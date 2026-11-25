import { Tailwind_semantic } from "../utils/tailwindConfig";

export interface ILiftographPaletteEntry {
  stroke: string;
  text: string;
}

export const LiftographPalette_names = ["red", "blue", "green", "orange", "purple", "gray"] as const;
const names = LiftographPalette_names;

function entries(): Record<(typeof names)[number], ILiftographPaletteEntry> {
  const semantic = Tailwind_semantic();
  return {
    purple: { stroke: semantic.graph.purple, text: semantic.text.purple },
    blue: { stroke: semantic.graph.blue, text: semantic.text.link },
    red: { stroke: semantic.graph.red, text: semantic.text.error },
    green: { stroke: semantic.text.success, text: semantic.text.success },
    orange: { stroke: semantic.graph.orange, text: semantic.text.cardyellowsubtle },
    gray: { stroke: semantic.text.secondary, text: semantic.text.secondary },
  };
}

const HEX_DIGITS = "0123456789abcdefABCDEF";
const HEX_LENGTHS = [4, 7, 9];

export function LiftographPalette_isHex(color: string): boolean {
  return (
    color[0] === "#" &&
    HEX_LENGTHS.indexOf(color.length) !== -1 &&
    Array.from(color.slice(1)).every((char) => HEX_DIGITS.indexOf(char) !== -1)
  );
}

export function LiftographPalette_entry(color: string | undefined, index: number): ILiftographPaletteEntry {
  if (color != null && LiftographPalette_isHex(color)) {
    return { stroke: color, text: color };
  }
  const palette = entries();
  const named = names.find((name) => name === color);
  if (named != null) {
    return palette[named];
  }
  // personal-fork: series without a chosen colour go ink, blue, grey, as in the instrument look
  const semantic = Tailwind_semantic();
  const order: ILiftographPaletteEntry[] = [
    { stroke: semantic.text.primary, text: semantic.text.primary },
    { stroke: semantic.text.accent, text: semantic.text.accent },
    { stroke: semantic.text.ink3, text: semantic.text.secondary },
  ];
  return order[index % order.length];
}
