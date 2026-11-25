import type { JSX } from "react";
import { Circle, Path } from "../primitives/svg";
import { IconSvg } from "./iconSvg";
import { Tailwind_semantic } from "../../utils/tailwindConfig";

interface IProps {
  size?: number;
  color?: string;
  isSelected?: boolean;
}

// personal-fork: 24px line icon of the instrument look
export function IconMe(props: IProps): JSX.Element {
  const size = props.size ?? 24;
  const color =
    props.color ?? (props.isSelected ? Tailwind_semantic().menu.iconactive : Tailwind_semantic().icon.neutral);
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
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4.5 20.5c1.3-3.8 4.2-5.5 7.5-5.5s6.2 1.7 7.5 5.5" />
    </IconSvg>
  );
}
