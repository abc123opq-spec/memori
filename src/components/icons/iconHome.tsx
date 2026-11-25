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
export function IconHome(props: IProps): JSX.Element {
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
      <Path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
    </IconSvg>
  );
}
