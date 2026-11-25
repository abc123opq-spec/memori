import type { JSX } from "react";
import { Path } from "../primitives/svg";
import { IconSvg } from "./iconSvg";
import { Tailwind_semantic } from "../../utils/tailwindConfig";

interface IProps {
  size?: number;
  color?: string;
  isSelected?: boolean;
}

// personal-fork: 24px line icon of the instrument look
export function IconDoc2(props: IProps): JSX.Element {
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
      <Path d="M6 3h8l4 4v14H6z" />
      <Path d="M14 3v4h4M9 12h6M9 16h6" />
    </IconSvg>
  );
}
