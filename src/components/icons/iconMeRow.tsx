import type { JSX } from "react";
import { View } from "react-native";
import { Path } from "../primitives/svg";
import { IconSvg } from "./iconSvg";
import { Tailwind_semantic } from "../../utils/tailwindConfig";

const paths = {
  program: ["M6 3h8l4 4v14H6z", "M14 3v4h4M9 12h6M9 16h6"],
  weight: ["M5.5 20l2-10.5h9l2 10.5z", "M9.5 9.5a2.5 2.5 0 1 1 5 0"],
  percent: ["M19 5L5 19", "M7 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  measure: ["M3.5 15.5l12-12 5 5-12 12z", "M7.5 11.5l2 2M10.5 8.5l2 2M13.5 5.5l2 2"],
  moon: ["M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"],
  exercises: ["M2.5 12h19M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5"],
  muscles: ["M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M5 10h14M12 10v5M9 21l3-6 3 6"],
  timer: ["M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 9v4l2.5 2.5M10 2.5h4"],
  formula: ["M6 3h12v18H6z", "M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"],
  gym: ["M4 20V9l8-5 8 5v11", "M9 20v-6h6v6"],
  plate: ["M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z", "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  ruler: ["M3 8h18v8H3z", "M7 8v3M11 8v4M15 8v3M19 8v4"],
  calendar: ["M4 6h16v14H4z", "M4 10h16M8 3v4M16 3v4"],
  theme: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 3v18M12 8l5-3.5M12 13l7.5-5M12 18l7-4"],
  health: ["M12 20s-7.5-4.5-7.5-10a4 4 0 0 1 7.5-2 4 4 0 0 1 7.5 2c0 5.5-7.5 10-7.5 10z"],
};

export type IIconMeRowName = keyof typeof paths;

// personal-fork: 24px line icons for the rows of the Me screen, in the instrument look
export function IconMeRow(props: { name: IIconMeRowName }): JSX.Element {
  return (
    <View className="pr-3" style={{ paddingVertical: 14 }}>
      <IconSvg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={Tailwind_semantic().icon.neutral}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[props.name].map((d) => (
          <Path key={d} d={d} />
        ))}
      </IconSvg>
    </View>
  );
}
