import type { JSX } from "react";
import { Path } from "../primitives/svg";
import { IconSvg } from "./iconSvg";
import { Tailwind_semantic } from "../../utils/tailwindConfig";

interface IProps {
  color?: string;
  size?: number;
}

// personal-fork: 24px line icon of the instrument look
export function IconGraphs(props: IProps): JSX.Element {
  const size = props.size ?? 24;
  const color = props.color || Tailwind_semantic().icon.neutral;
  return (
    <IconSvg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 4v16h16" />
      <Path d="m7 15 4-5 3 3 5-6" />
    </IconSvg>
  );
}
