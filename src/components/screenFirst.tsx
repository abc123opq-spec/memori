import { JSX, ReactNode, useEffect, useRef } from "react";
import { View, Platform, Animated, Easing, ViewStyle } from "react-native";
import { Text } from "./primitives/text";
import { Thunk_pushScreen } from "../ducks/thunks";
import { IDispatch } from "../ducks/types";
import { useNavOptions } from "../navigation/useNavOptions";
import { Button } from "./button";
import { IconArrowRight } from "./icons/iconArrowRight";
import StorySlider from "./storySlider";
import { IconKettlebell } from "./icons/iconKettlebell";
import { Tailwind_colors, Tailwind_semantic } from "../utils/tailwindConfig";
import { IconWorkoutProgress } from "./icons/iconWorkoutProgress";
import { IconEditor } from "./icons/iconEditor";
import { IconTracker } from "./icons/iconTracker";
import { PersonalArtImage } from "../personal/personalArtImage";
import { PersonalUnits_skipUnitScreen } from "../models/personalUnits";
import { Language_current } from "../i18n/language";

interface IProps {
  dispatch: IDispatch;
}

export function ScreenFirst(props: IProps): JSX.Element {
  useNavOptions({ navHidden: true });
  const white = Tailwind_colors().white;

  // personal-fork: mascot removed, art slot in src/personal/art.ts
  return (
    <View
      className="flex flex-col flex-1 bg-background-default"
      style={Platform.OS === "web" ? ({ height: "100dvh" } as unknown as ViewStyle) : undefined}
    >
      <View className="flex-1 px-gutter pt-16 pb-4">
        <StorySlider
          slides={[
            <FirstSlide />,
            <RestSlide
              header={
                <View className="flex-row items-center justify-center">
                  <IconKettlebell color={white} />
                  <Text className="ml-2 text-sm font-semibold text-text-alwayswhite">Weightlifting Programs</Text>
                </View>
              }
              bodyText="Start with a pre-built weightlifting program, or create your own."
            />,
            <RestSlide
              header={
                <View className="flex-row items-center justify-center">
                  <IconWorkoutProgress color={white} />
                  <Text className="ml-2 text-sm font-semibold text-text-alwayswhite">Workout Tracker</Text>
                </View>
              }
              bodyText="Log sets with one tap. Your reps and weight adjust automatically."
            />,
            <RestSlide
              header={
                <View className="flex-row items-center justify-center">
                  <IconEditor color={white} />
                  <Text className="ml-2 text-sm font-semibold text-text-alwayswhite">Program Editor</Text>
                </View>
              }
              bodyText="Modify or switch any program anytime to fit your goals."
            />,
            <RestSlide
              header={
                <View className="flex-row items-center justify-center">
                  <IconTracker color={white} />
                  <Text className="ml-2 text-sm font-semibold text-text-alwayswhite">Workout History</Text>
                </View>
              }
              bodyText="Track your weekly stats to stay on target!"
            />,
          ]}
          duration={5000}
        />
      </View>
      <View className="pb-6 mx-4">
        <Button
          className="w-full ls-onboarding-start"
          name="see-how-it-works"
          kind="purple"
          onClick={() =>
            props.dispatch(
              // personal-fork: Japanese users start in kg, so the unit picker is skipped
              Thunk_pushScreen(PersonalUnits_skipUnitScreen(Language_current()) ? "setupequipment" : "units")
            )
          }
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-xs font-semibold text-button-primarylabel">Get started</Text>
            <AnimatedArrow />
          </View>
        </Button>
        {/* personal-fork: no "I have an account" entry; the account modal signs in with the author's servers */}
      </View>
    </View>
  );
}

function AnimatedArrow(): JSX.Element {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 4,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <Animated.View style={{ marginLeft: 8, transform: [{ translateX }] }}>
      <IconArrowRight color={Tailwind_semantic().button.primarylabel} />
    </Animated.View>
  );
}

function FirstSlide(): JSX.Element {
  return (
    <View className={slideClassName}>
      {/* personal-fork: Japanese gets one natural sentence instead of the word-by-word English layout */}
      {Language_current() === "ja" ? (
        <Text className="px-8 pt-16 text-3xl font-bold leading-scaled-9 text-text-alwayswhite">
          The most powerful weightlifting planner and tracker app
        </Text>
      ) : (
        <Text i18nContext="first" className="px-8 pt-16 text-3xl font-bold leading-scaled-9 text-text-alwayswhite">
          The most powerful weightlifting{" "}
          <Text i18nContext="first" className="text-3xl text-text-alwayswhite">
            planner
          </Text>{" "}
          and{" "}
          <Text i18nContext="first" className="text-3xl text-text-alwayswhite">
            tracker
          </Text>{" "}
          app
        </Text>
      )}
      <Text className="px-8 py-6 text-base leading-relaxed text-text-alwayswhite opacity-80">
        Build any weightlifting program using a simple scripting language and track your progress.
      </Text>
      <PersonalArtImage slot="onboarding" isDark={true} className="items-center justify-center flex-1 pb-8" />
    </View>
  );
}

const slideClassName =
  "relative flex flex-col w-full h-full overflow-hidden bg-black border border-border-line rounded-lg";

interface IRestSlideProps {
  header: ReactNode;
  bodyText: string;
}

function RestSlide(props: IRestSlideProps): JSX.Element {
  return (
    <View className={slideClassName}>
      <View className="px-8 pt-16">{props.header}</View>
      <Text className="px-8 py-6 text-xl font-semibold leading-relaxed text-center text-text-alwayswhite">
        {props.bodyText}
      </Text>
      <PersonalArtImage slot="onboarding" isDark={true} className="items-center justify-center flex-1 pb-8" />
    </View>
  );
}
