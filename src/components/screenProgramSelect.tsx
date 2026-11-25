import { JSX, ReactNode } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./primitives/text";
import { Path } from "./primitives/svg";
import { IconSvg } from "./icons/iconSvg";
import { IDispatch } from "../ducks/types";
import { ISettings } from "../types";
import { useNavOptions } from "../navigation/useNavOptions";
import { Thunk_pushScreen } from "../ducks/thunks";
import { IconDoc } from "./icons/iconDoc";
import { navigateToModal } from "../navigation/navigationService";
import { IconEditSquare } from "./icons/iconEditSquare";
import { emptyProgramId, Program_selectProgramAndGoHome } from "../models/program";
import { IconEquipmentKettlebell } from "./icons/iconEquipmentKettlebell";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { PersonalArtImage } from "../personal/personalArtImage";
import { useTrackClick } from "../utils/clickTracking";

interface IScreenProgramSelectProps {
  dispatch: IDispatch;
  settings: ISettings;
}

interface IOption {
  key: string;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function ScreenProgramSelect(props: IScreenProgramSelectProps): JSX.Element {
  useNavOptions({ navHidden: true });
  const insets = useSafeAreaInsets();
  const trackClick = useTrackClick();

  const options: IOption[] = [
    {
      key: "builtin",
      icon: <IconDoc width={24} height={24} />,
      title: "Pick a built-in program",
      description: "Choose from popular routines like 5/3/1, GZCLP, and more",
      onClick: () => props.dispatch(Thunk_pushScreen("programs")),
    },
    {
      key: "create",
      icon: <IconEditSquare />,
      title: "Create a program",
      description: "Build your own custom routine from scratch",
      onClick: () => navigateToModal("createProgramModal"),
    },
    // personal-fork: needs liftosaur.com server
    {
      key: "adhoc",
      icon: <IconEquipmentKettlebell size={24} />,
      title: "Go without program",
      description: "You can run adhoc workouts, and build the program along the way",
      onClick: () => Program_selectProgramAndGoHome(props.dispatch, emptyProgramId),
    },
  ];

  return (
    <View
      className="flex flex-col flex-1 bg-background-default"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 px-gutter pt-8 pb-4">
        {/* personal-fork: mascot removed, art slot in src/personal/art.ts */}
        <PersonalArtImage slot="onboarding" className="items-center p-4" />
        <View className="px-2 -mt-1">
          <Text className="mb-2 text-xl font-bold text-center text-text-primary">Choose your program</Text>
          <Text className="mb-6 text-sm text-center text-text-secondary">
            How would you like to set up your training?
          </Text>

          {/* personal-fork: line-separated rows of the instrument look instead of purple cards */}
          <View className="border-t border-border-line">
            {options.map((opt) => (
              <Pressable
                key={opt.key}
                className="flex-row items-center w-full gap-3 py-4 border-b border-border-line nm-program-select"
                data-testid={`program-select-${opt.key}`}
                testID={`program-select-${opt.key}`}
                onPress={() => {
                  trackClick(`program-select-${opt.key}`, `ls-onboarding-program-${opt.key}`);
                  opt.onClick();
                }}
              >
                <View className="items-center w-6">{opt.icon}</View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-text-primary">{opt.title}</Text>
                  <Text className="mt-0.5 text-sm text-text-secondary">{opt.description}</Text>
                </View>
                <View>
                  <IconSvg width={16} height={16} viewBox="0 0 16 16" fill="none">
                    <Path
                      d="M6 4l4 4-4 4"
                      stroke={Tailwind_semantic().text.ink3}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </IconSvg>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
