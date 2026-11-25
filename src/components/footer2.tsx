import { JSX } from "react";
import { View, Pressable, Image } from "react-native";
import { ImagePreloader_uri } from "../utils/imagePreloader";
import { Text } from "./primitives/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Thunk_pushScreen, Thunk_pushToEditProgram, Thunk_startProgramDay } from "../ducks/thunks";
import { IDispatch } from "../ducks/types";
import { ITab } from "../models/screen";
import { FooterButton, FooterButton_labelStyle } from "./footerButton";
import { IconGraphs } from "./icons/iconGraphs";
import { IconHome } from "./icons/iconHome";
import { IconMe } from "./icons/iconMe";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { IconDoc2 } from "./icons/iconDoc2";
import { INavCommon } from "../models/state";
import { IconBarbell2 } from "./icons/iconBarbell2";
import { Program_evaluate } from "../models/program";
import { navigateToModal } from "../navigation/navigationService";
import { IHistoryRecord } from "../types";
import { WorkoutElapsed } from "./workoutElapsed";
import { useRemScale } from "../utils/useRem";

interface IFooterProps {
  dispatch: IDispatch;
  navCommon: INavCommon;
  currentTab: ITab;
  progress?: IHistoryRecord;
}

function getHasErrorsInProgram(navCommon: INavCommon): boolean {
  const program = navCommon.currentProgram;
  if (!program) {
    return false;
  }
  const evaluatedProgram = Program_evaluate(program, navCommon.settings);
  return evaluatedProgram.errors.length > 0;
}

// personal-fork: flat tab bar of the instrument look, 1px top line, the ongoing workout's elapsed time as the workout tab label
export function Footer2View(props: IFooterProps): JSX.Element {
  const semantic = Tailwind_semantic();
  const iconColor = (isActive: boolean): string => (isActive ? semantic.menu.iconactive : semantic.icon.neutralsubtle);
  const currentTab = props.currentTab;
  const hasErrorsInProgram = getHasErrorsInProgram(props.navCommon);
  const insets = useSafeAreaInsets();
  const remScale = useRemScale();
  const isWorkoutTab = currentTab === "workout";
  const workoutLabelClass = isWorkoutTab ? "font-semibold text-text-primary" : "font-medium text-text-ink3";
  return (
    <View
      className="items-center w-full border-t bg-background-default border-border-line"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row w-full px-1 pt-1">
        <FooterButton
          name="home"
          currentTab={currentTab}
          icon={(isActive) => <IconHome isSelected={isActive} color={iconColor(isActive)} />}
          text="Home"
          onClick={() => props.dispatch(Thunk_pushScreen("main", undefined, { tab: "home" }))}
        />
        <FooterButton
          name="program"
          currentTab={currentTab}
          icon={(isActive) => <IconDoc2 isSelected={isActive} color={iconColor(isActive)} />}
          hasDot={hasErrorsInProgram || (props.navCommon.unseenProgramEdits ?? 0) > 0}
          text="Program"
          onClick={() => props.dispatch(Thunk_pushToEditProgram())}
        />
        <Pressable
          data-testid="footer-workout"
          testID="footer-workout"
          accessibilityRole="button"
          className="items-center justify-center flex-1 px-0.5"
          style={{ minHeight: 50 }}
          onPress={() => {
            if (props.navCommon.isOngoingProgress) {
              props.dispatch(Thunk_startProgramDay());
            } else {
              navigateToModal("nextWorkoutModal");
            }
          }}
        >
          <IconBarbell2 size={24} isSelected={isWorkoutTab} color={iconColor(isWorkoutTab)} />
          {props.progress != null ? (
            <WorkoutElapsed
              progress={props.progress}
              testID="footer-workout-elapsed"
              className={`pt-0.5 font-semibold text-text-primary`}
              style={FooterButton_labelStyle(remScale)}
            />
          ) : (
            <Text numberOfLines={1} className={`pt-0.5 ${workoutLabelClass}`} style={FooterButton_labelStyle(remScale)}>
              Workout
            </Text>
          )}
        </Pressable>
        {props.navCommon.isThanksgivingPromo ? (
          <FooterButton
            name="graphs"
            currentTab={currentTab}
            icon={() => (
              <Image
                source={{ uri: ImagePreloader_uri("/images/turkeyicon.png") }}
                style={{ width: 24, height: 24 }}
                accessibilityLabel="Thanksgiving promo"
              />
            )}
            text="Promo"
            onClick={() => navigateToModal("thanksgivingModal")}
          />
        ) : (
          <FooterButton
            name="graphs"
            currentTab={currentTab}
            icon={(isActive) => <IconGraphs color={iconColor(isActive)} />}
            text="Graphs"
            onClick={() => props.dispatch(Thunk_pushScreen("graphsList", undefined, { tab: "graphs" }))}
          />
        )}
        <FooterButton
          name="me"
          currentTab={currentTab}
          icon={(isActive) => <IconMe isSelected={isActive} color={iconColor(isActive)} />}
          hasDot={(props.navCommon.pendingFollowRequests ?? 0) > 0}
          text="Me"
          onClick={() => props.dispatch(Thunk_pushScreen("settings", undefined, { tab: "me" }))}
        />
      </View>
    </View>
  );
}
