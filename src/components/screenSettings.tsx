import { JSX, memo, useEffect, useState } from "react";
import { View, Pressable, Linking, Platform } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { MenuItem, MenuItemWrapper } from "./menuItem";
import {
  Thunk_pushScreen,
  Thunk_exportStorage,
  Thunk_exportHistoryToCSV,
  Thunk_exportProgramsToText,
} from "../ducks/thunks";
import { MenuItemEditable } from "./menuItemEditable";
import { Rm1Formula_fromSettings, Rm1Formula_name } from "../models/rm1Formula";
import { lb } from "lens-shmens";
import { IUser } from "../models/user";
import { IImportSession, ILengthUnit, ISettings, IStats, ISubscription, IUnit } from "../types";
import { ImporterStorage } from "./importerStorage";
import { HostConfig_webPath } from "../utils/webPath";
import { ImporterProgram } from "./importerProgram";
import { useNavOptions } from "../navigation/useNavOptions";
import { GroupHeader } from "./groupHeader";
import { IconSpeaker } from "./icons/iconSpeaker";
import { IconMeRow } from "./icons/iconMeRow";
import { PersonalBackupNote } from "../personal/safetyNotes";
import { PersonalSource_current } from "../personal/source";
import { ImporterLiftosaurCsv } from "./importerLiftosaurCsv";
import { navigateToModal } from "../navigation/navigationService";
import { HealthSync_eligibleForAppleHealth, HealthSync_eligibleForGoogleHealth } from "../lib/healthSync";
import { INavCommon } from "../models/state";
import { Stats_getCurrentBodyweight, Stats_getCurrentBodyfat } from "../models/stats";
import { Weight_print } from "../models/weight";
import { Settings_getTextSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX, TEXT_SIZE_STEP } from "../models/settings";
import { TextSize_apply } from "../utils/textSize";
import { useOsFontScale } from "../utils/fontScale";
import { LinkButton } from "./linkButton";
import { Slider } from "./primitives/slider";
import { usePerfRenderCount } from "../utils/usePerfRenderCount";

interface IProps {
  dispatch: IDispatch;
  subscription: ISubscription;
  tempUserId?: string;
  stats: IStats;
  user?: IUser;
  currentProgramName?: string;
  settings: ISettings;
  importSessions?: IImportSession[];
  navCommon: INavCommon;
}

function openExternal(url: string): void {
  Linking.openURL(url).catch(() => undefined);
}

function ScreenSettingsInner(props: IProps): JSX.Element {
  usePerfRenderCount("ScreenSettings");
  const osFontScale = useOsFontScale();
  // This screen reads settings via `untrack`, so it doesn't re-render when `theme` changes.
  // Track the choice locally so the select shows the tap instead of snapping back.
  const [theme, setTheme] = useState<"dark" | "light" | undefined>(props.settings.theme);
  useEffect(() => {
    setTheme(props.settings.theme);
  }, [props.settings]);
  const currentBodyweight = Stats_getCurrentBodyweight(props.stats);
  const currentBodyfat = Stats_getCurrentBodyfat(props.stats);

  useNavOptions({ navTitle: "Me", navHelpKey: "settings" });

  // personal-fork: rows of the instrument look carry a line icon and an ink-2 value instead of a link-blue one
  return (
    <View className="px-gutter">
      <MenuItem
        shouldShowRightArrow={true}
        name="Program"
        prefix={<IconMeRow name="program" />}
        value={
          <View className="flex-row items-center flex-shrink gap-2">
            <Text noTranslate={true} numberOfLines={1} className="flex-shrink text-right text-text-secondary">
              {props.currentProgramName}
            </Text>
            {props.navCommon.unseenProgramEdits ? (
              <View testID="program-edits-dot" className="w-2 h-2 rounded-full bg-background-error" />
            ) : null}
          </View>
        }
        onClick={() => {
          props.dispatch(Thunk_pushScreen("programs"));
        }}
      />
      {/* personal-fork: needs liftosaur.com server */}

      <GroupHeader name="My Measurements" topPadding={true} />
      {currentBodyweight && (
        <MenuItem
          name="Bodyweight"
          prefix={<IconMeRow name="weight" />}
          value={<Text className="text-right text-text-secondary">{Weight_print(currentBodyweight)}</Text>}
          shouldShowRightArrow={true}
          onClick={() => props.dispatch(Thunk_pushScreen("measurements", { key: "weight" }))}
        />
      )}
      {currentBodyfat && (
        <MenuItem
          name="Bodyfat"
          prefix={<IconMeRow name="percent" />}
          value={<Text className="text-right text-text-secondary">{Weight_print(currentBodyfat)}</Text>}
          shouldShowRightArrow={true}
          onClick={() => props.dispatch(Thunk_pushScreen("measurements", { key: "bodyfat" }))}
        />
      )}
      <MenuItem
        name="Measurements"
        prefix={<IconMeRow name="measure" />}
        shouldShowRightArrow={true}
        onClick={() => props.dispatch(Thunk_pushScreen("measurements"))}
      />
      <MenuItem
        name="Sleep & Nutrition"
        prefix={<IconMeRow name="moon" />}
        shouldShowRightArrow={true}
        onClick={() => props.dispatch(Thunk_pushScreen("sleepNutrition"))}
      />

      <GroupHeader name="Workout" topPadding={true} />
      <MenuItem
        name="Exercises"
        prefix={<IconMeRow name="exercises" />}
        onClick={() => props.dispatch(Thunk_pushScreen("exercises"))}
        shouldShowRightArrow={true}
      />
      <MenuItem
        name="Muscle Groups"
        prefix={<IconMeRow name="muscles" />}
        onClick={() => props.dispatch(Thunk_pushScreen("muscleGroups"))}
        shouldShowRightArrow={true}
      />
      <MenuItem
        name="Timers"
        prefix={<IconMeRow name="timer" />}
        onClick={() => props.dispatch(Thunk_pushScreen("timers"))}
        shouldShowRightArrow={true}
      />
      <MenuItem
        name="1RM Formula"
        prefix={<IconMeRow name="formula" />}
        value={
          <Text className="text-right text-text-secondary">
            {Rm1Formula_name(Rm1Formula_fromSettings(props.settings))}
          </Text>
        }
        onClick={() => props.dispatch(Thunk_pushScreen("rm1Formula"))}
        shouldShowRightArrow={true}
      />
      {/* personal-fork: friend notifications need the liftosaur.com server */}
      {props.settings.gyms.length > 1 && (
        <MenuItemEditable
          type="select"
          name="Current Gym"
          prefix={<IconMeRow name="gym" />}
          value={props.settings.currentGymId ?? props.settings.gyms[0].id}
          values={props.settings.gyms.map((g) => [g.id, g.name])}
          onChange={(newValue) => {
            if (newValue != null) {
              props.dispatch({
                type: "UpdateSettings",
                lensRecording: lb<ISettings>().p("currentGymId").record(newValue),
                desc: "Change current gym",
              });
            }
          }}
        />
      )}
      <MenuItem
        shouldShowRightArrow={true}
        name="Available Equipment"
        prefix={<IconMeRow name="plate" />}
        onClick={() => {
          if (props.settings.gyms.length > 1) {
            props.dispatch(Thunk_pushScreen("gyms"));
          } else {
            props.dispatch(Thunk_pushScreen("plates"));
          }
        }}
      />
      <MenuItemEditable
        type="select"
        name="Weight Units"
        prefix={<IconMeRow name="weight" />}
        value={props.settings.units}
        values={[
          ["kg", "kg"],
          ["lb", "lb"],
        ]}
        onChange={(newValue) => {
          props.dispatch({
            type: "UpdateSettings",
            lensRecording: lb<ISettings>()
              .p("units")
              .record(newValue as IUnit),
            desc: "Change weight units",
          });
        }}
      />
      <MenuItemEditable
        type="select"
        name="Length Units"
        prefix={<IconMeRow name="ruler" />}
        value={props.settings.lengthUnits}
        values={[
          ["cm", "cm"],
          ["in", "in"],
        ]}
        onChange={(newValue) => {
          props.dispatch({
            type: "UpdateSettings",
            lensRecording: lb<ISettings>()
              .p("lengthUnits")
              .record(newValue as ILengthUnit),
            desc: "Change length units",
          });
        }}
      />
      <MenuItemEditable
        type="select"
        name="Week starts from:"
        prefix={<IconMeRow name="calendar" />}
        value={props.settings.startWeekFromMonday ? "true" : "false"}
        values={[
          ["false", "Sunday"],
          ["true", "Monday"],
        ]}
        onChange={(newValue) => {
          props.dispatch({
            type: "UpdateSettings",
            lensRecording: lb<ISettings>()
              .p("startWeekFromMonday")
              .record(newValue === "true"),
            desc: "Toggle week start day",
          });
        }}
      />
      {(Platform.OS === "ios" || Platform.OS === "android") && (
        <MenuItemEditable
          type="boolean"
          name="Always On Display"
          value={props.settings.alwaysOnDisplay ? "true" : "false"}
          onChange={(newValue) => {
            props.dispatch({
              type: "UpdateSettings",
              lensRecording: lb<ISettings>()
                .p("alwaysOnDisplay")
                .record(newValue === "true"),
              desc: "Toggle always-on display",
            });
          }}
        />
      )}
      {(Platform.OS === "ios" || Platform.OS === "android") && (
        <View>
          <GroupHeader name="Sound" topPadding={true} />
          <MenuItemEditable
            type="boolean"
            name="Vibration"
            value={props.settings.vibration ? "true" : "false"}
            onChange={(newValue) => {
              props.dispatch({
                type: "UpdateSettings",
                lensRecording: lb<ISettings>()
                  .p("vibration")
                  .record(newValue === "true"),
                desc: "Toggle vibration",
              });
            }}
          />
          <MenuItemWrapper name="volume">
            <View className="flex-row items-center py-2">
              <View className="mr-2">
                <IconSpeaker />
              </View>
              <View className="flex-row flex-1">
                <Slider
                  value={props.settings.volume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => {
                    props.dispatch({
                      type: "UpdateSettings",
                      lensRecording: lb<ISettings>().p("volume").record(value),
                      desc: "Change volume",
                    });
                  }}
                />
              </View>
            </View>
          </MenuItemWrapper>
        </View>
      )}
      {(HealthSync_eligibleForAppleHealth() || HealthSync_eligibleForGoogleHealth()) && (
        <>
          <GroupHeader name="Sync" topPadding={true} />
          {HealthSync_eligibleForGoogleHealth() && (
            <MenuItem
              shouldShowRightArrow={true}
              name="Google Health Connect"
              prefix={<IconMeRow name="health" />}
              onClick={() => props.dispatch(Thunk_pushScreen("googleHealth"))}
            />
          )}
          {HealthSync_eligibleForAppleHealth() && (
            <MenuItem
              shouldShowRightArrow={true}
              name="Apple Health"
              prefix={<IconMeRow name="health" />}
              onClick={() => props.dispatch(Thunk_pushScreen("appleHealth"))}
            />
          )}
        </>
      )}
      <GroupHeader name="Appearance" topPadding={true} />
      <MenuItemWrapper name="text-size">
        <View className="py-2">
          <View className="flex-row items-center">
            <View className="flex-row items-baseline mr-2">
              <Text className="text-xs">A</Text>
              <Text className="text-lg">A</Text>
            </View>
            <View className="flex-row flex-1">
              <Slider
                value={Settings_getTextSize(props.settings, osFontScale)}
                min={TEXT_SIZE_MIN}
                max={TEXT_SIZE_MAX}
                step={TEXT_SIZE_STEP}
                onChange={(value) => {
                  TextSize_apply(value);
                  props.dispatch({
                    type: "UpdateSettings",
                    lensRecording: lb<ISettings>().p("textSize").record(value),
                    desc: "Change text size",
                  });
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-xs text-text-secondary">
              {props.settings.textSize == null ? "Matching your device text size" : "Set in the app"}
            </Text>
            {props.settings.textSize != null && (
              <LinkButton
                name="text-size-reset"
                className="text-xs font-normal"
                onClick={() => {
                  TextSize_apply(Settings_getTextSize({ ...props.settings, textSize: undefined }, osFontScale));
                  props.dispatch({
                    type: "UpdateSettings",
                    lensRecording: lb<ISettings>().p("textSize").record(undefined),
                    desc: "Follow device text size",
                  });
                }}
              >
                Use device size
              </LinkButton>
            )}
          </View>
        </View>
      </MenuItemWrapper>
      <MenuItemEditable
        type="select"
        name="Theme"
        prefix={<IconMeRow name="theme" />}
        value={theme ?? "system"}
        values={[
          ["system", "System"],
          ["light", "Light"],
          ["dark", "Dark"],
        ]}
        onChange={(newValue) => {
          const newTheme = newValue === "dark" || newValue === "light" ? newValue : undefined;
          setTheme(newTheme);
          props.dispatch({
            type: "UpdateSettings",
            lensRecording: lb<ISettings>().p("theme").record(newTheme),
            desc: "Change theme",
          });
        }}
      />
      {/* personal-fork: needs liftosaur.com server */}
      <GroupHeader name="Import / Export" topPadding={true} />
      <MenuItemWrapper name="Export data to JSON file" onClick={() => props.dispatch(Thunk_exportStorage())}>
        <View className="py-3.5">
          <Text className="text-base text-text-primary">Export data to JSON file</Text>
        </View>
        <PersonalBackupNote />
      </MenuItemWrapper>
      <MenuItemWrapper name="Export history to CSV file" onClick={() => props.dispatch(Thunk_exportHistoryToCSV())}>
        <View className="py-3.5">
          <Text className="text-base text-text-primary">Export history to CSV file</Text>
        </View>
      </MenuItemWrapper>
      <MenuItemWrapper
        name="Export all programs to text file"
        onClick={() => props.dispatch(Thunk_exportProgramsToText())}
      >
        <View className="py-3.5">
          <Text className="text-base text-text-primary">Export all programs to text file</Text>
        </View>
      </MenuItemWrapper>
      <ImporterLiftosaurCsv dispatch={props.dispatch} />
      <ImporterStorage dispatch={props.dispatch} />
      <ImporterProgram dispatch={props.dispatch} />
      <MenuItemWrapper
        name="Import history from other apps"
        onClick={() => navigateToModal("importFromOtherAppsModal")}
      >
        <View className="py-3.5">
          <Text className="text-base text-text-primary">Import history from other apps</Text>
        </View>
      </MenuItemWrapper>
      {(props.importSessions ?? []).length > 0 && (
        <MenuItem
          shouldShowRightArrow={true}
          name="Recent imports"
          onClick={() => props.dispatch(Thunk_pushScreen("recentImports"))}
        />
      )}

      <GroupHeader name="Miscellaneous" topPadding={true} />
      {/* personal-fork: the changelog is the author's release notes */}
      {/* personal-fork: needs liftosaur.com server */}
      <Pressable
        className="py-3.5 border-b border-border-neutral"
        onPress={() => openExternal(HostConfig_webPath("/licenses.html"))}
      >
        <Text className="text-base text-text-primary">Licenses</Text>
      </Pressable>
      {/* personal-fork: AGPL-3.0 source offer; links to the GitHub repository, or the licenses page elsewhere */}
      <Pressable
        testID="menu-item-source-code"
        data-testid="menu-item-source-code"
        className="py-3.5 border-b border-border-neutral"
        onPress={() => openExternal(PersonalSource_current() ?? HostConfig_webPath("/licenses.html"))}
      >
        <Text className="text-base text-text-primary">Source code (AGPL-3.0)</Text>
      </Pressable>
      {/* personal-fork: needs liftosaur.com server */}
    </View>
  );
}

export const ScreenSettings = memo(ScreenSettingsInner);
