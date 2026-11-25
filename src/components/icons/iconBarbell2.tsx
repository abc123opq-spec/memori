import type { JSX } from "react";
import { Path } from "../primitives/svg";
import { IconSvg } from "./iconSvg";
import { Tailwind_semantic } from "../../utils/tailwindConfig";

interface IProps {
  size?: number;
  color?: string;
  isSelected?: boolean;
}

// personal-fork: line icon of the instrument look; it sits on the primary button, so it takes the button label color
export function IconBarbell2(props: IProps): JSX.Element {
  const size = props.size ?? 32;
  const color = props.color ?? Tailwind_semantic().button.primarylabel;
  return (
    <IconSvg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={props.isSelected ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M2.5 12h19M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5" />
    </IconSvg>
  );
}
