import type { JSX } from "react";
import { View, Pressable } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { Button } from "./button";
import { updateSettings } from "../models/state";
import { ISettings } from "../types";
import { useNavOptions } from "../navigation/useNavOptions";
import { Thunk_pushScreen } from "../ducks/thunks";
import { lb } from "lens-shmens";
import { PersonalArtImage } from "../personal/personalArtImage";

interface IProps {
  dispatch: IDispatch;
  settings: ISettings;
}

export function ScreenUnitSelector(props: IProps): JSX.Element {
  const selectedButtonCls = "bg-button-primarybackground border-button-primarybackground";
  const unselectedButtonCls = "bg-background-default border-border-control";

  useNavOptions({ navHidden: true });

  return (
    <View className="flex flex-col flex-1 bg-background-default">
      <View className="flex-1 px-gutter pt-16 pb-4">
        <View className="w-full h-full border border-border-line rounded-lg bg-background-surface">
          {/* personal-fork: mascot removed, art slot in src/personal/art.ts */}
          <PersonalArtImage slot="onboarding" className="items-center p-4" />
          <Text className="px-6 pt-4 text-2xl font-semibold text-center">Pick your units</Text>
          <Text i18nContext="unitSelector" className="px-6 py-4 text-base text-center">
            Your chosen units will be the default, but you can override them or change them in{" "}
            <Text className="font-bold">Settings</Text> or <Text className="font-bold">per equipment</Text> anytime.
          </Text>
          <View className="flex-row px-6">
            <Pressable
              className={`flex-1 px-2 py-3 border rounded-tl-lg rounded-bl-lg ${props.settings.units === "lb" ? selectedButtonCls : unselectedButtonCls}`}
              onPress={() => {
                updateSettings(props.dispatch, lb<ISettings>().p("units").record("lb"), "Set units to pounds");
              }}
            >
              <Text
                className={`text-sm font-semibold text-center ${props.settings.units === "lb" ? "text-button-primarylabel" : "text-text-primary"}`}
              >
                Pounds (lb)
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 px-2 py-3 border rounded-tr-lg rounded-br-lg ${props.settings.units === "kg" ? selectedButtonCls : unselectedButtonCls}`}
              onPress={() => {
                updateSettings(props.dispatch, lb<ISettings>().p("units").record("kg"), "Set units to kilograms");
              }}
            >
              <Text
                className={`text-sm font-semibold text-center ${props.settings.units === "kg" ? "text-button-primarylabel" : "text-text-primary"}`}
              >
                Kilograms (kg)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View className="pb-16 mx-4 mb-2">
        <Button
          className="w-full ls-onboarding-units"
          name="see-how-it-works"
          kind="purple"
          onClick={() => props.dispatch(Thunk_pushScreen("setupequipment"))}
        >
          Continue
        </Button>
      </View>
    </View>
  );
}
