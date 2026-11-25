import { JSX, useState } from "react";
import { View, Pressable } from "react-native";
import { TextInput } from "./primitives/textInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { IHistoryRecord, IProgram, ISettings } from "../types";
import { INavCommon } from "../models/state";
import { useNavOptions } from "../navigation/useNavOptions";
import { BuiltinProgramsList } from "./builtinProgramsList";
import { CustomProgramsList } from "./customProgramsList";
import { emptyProgramId, IProgramIndexEntry, Program_selectProgramAndGoHome } from "../models/program";
import { IconMagnifyingGlass } from "./icons/iconMagnifyingGlass";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { useRemScale } from "../utils/useRem";
import { navigateToModal } from "../navigation/navigationService";

interface IProps {
  dispatch: IDispatch;
  programs: IProgram[];
  programsIndex: IProgramIndexEntry[];
  progress?: IHistoryRecord;
  settings: ISettings;
  customPrograms: IProgram[];
  editProgramId?: string;
  navCommon: INavCommon;
  hasBottomNav?: boolean;
}

export function ChooseProgramView(props: IProps): JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const hasCustomPrograms = props.customPrograms.length > 0;
  const remScale = useRemScale();

  useNavOptions({
    navTitle: "Choose a program",
    // personal-fork: needs liftosaur.com server
  });

  return (
    <View className="flex-1 bg-background-default">
      {/* personal-fork: search field on the surface, tabs and footer of the instrument look */}
      <View className="px-4 pt-2 pb-3">
        <View className="relative justify-center">
          <View className="absolute z-10 left-3">
            <IconMagnifyingGlass color={Tailwind_semantic().text.ink3} size={18} />
          </View>
          <TextInput
            className="w-full pr-4 rounded-lg pl-10 bg-background-surface text-text-primary"
            style={{ fontSize: 16 * remScale, height: 44 * remScale }}
            placeholder="Search by name"
            placeholderTextColor={Tailwind_semantic().text.secondarysubtle}
            defaultValue=""
            onChangeText={(text) => setSearch(text)}
            data-testid="program-search"
            testID="program-search"
            returnKeyType="search"
          />
        </View>
      </View>
      {hasCustomPrograms ? (
        <>
          <View className="flex-row mx-4 border-b border-border-line">
            {["Yours", "Built-in"].map((label, index) => (
              <Pressable
                key={label}
                className={`items-center justify-center flex-1 h-11 ${
                  selectedTab === index ? "border-b-2 border-text-primary" : ""
                }`}
                style={{ marginBottom: -1 }}
                onPress={() => setSelectedTab(index)}
                accessibilityRole="tab"
                accessibilityState={{ selected: selectedTab === index }}
                data-testid={`tab-${label.toLowerCase()}`}
                testID={`tab-${label.toLowerCase()}`}
              >
                <Text
                  className={`text-base ${
                    selectedTab === index ? "font-semibold text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedTab === 0 ? (
            <CustomProgramsList
              progress={props.progress}
              programs={props.customPrograms}
              settings={props.settings}
              dispatch={props.dispatch}
              search={search}
              programEdits={props.navCommon.programEdits}
            />
          ) : (
            <BuiltinProgramsList
              hasCustomPrograms={hasCustomPrograms}
              programs={props.programs}
              programsIndex={props.programsIndex}
              settings={props.settings}
              dispatch={props.dispatch}
              search={search}
            />
          )}
        </>
      ) : (
        <BuiltinProgramsList
          hasCustomPrograms={false}
          programs={props.programs}
          programsIndex={props.programsIndex}
          settings={props.settings}
          dispatch={props.dispatch}
          search={search}
        />
      )}
      <Footer
        hasBottomNav={props.hasBottomNav}
        onCreate={() => navigateToModal("createProgramModal")}
        onEmpty={() => {
          Program_selectProgramAndGoHome(props.dispatch, emptyProgramId);
        }}
      />
    </View>
  );
}

interface IFooterProps {
  onCreate: () => void;
  onEmpty: () => void;
  hasBottomNav?: boolean;
}

function Footer(props: IFooterProps): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="w-full gap-1 px-4 pt-3 border-t border-border-line bg-background-default"
      style={{ paddingBottom: (props.hasBottomNav ? 0 : insets.bottom) + 8 }}
    >
      <Pressable
        className="items-center justify-center w-full h-12 px-4 rounded-lg bg-button-primarybackground"
        accessibilityRole="button"
        data-testid="empty-program"
        testID="empty-program"
        onPress={props.onEmpty}
      >
        <Text className="text-base font-semibold text-button-primarylabel">Go Without Program</Text>
      </Pressable>
      <Pressable
        className="items-center justify-center w-full h-11 px-4"
        accessibilityRole="button"
        data-testid="create-program"
        testID="create-program"
        onPress={props.onCreate}
      >
        <Text className="text-base font-semibold text-text-primary">Create New Program</Text>
      </Pressable>
    </View>
  );
}
