import { JSX } from "react";
import { StringUtils_colonSpace } from "../utils/string";
import { PersonalFormat_duration, PersonalFormat_statLabel, PersonalFormat_volume } from "../personal/format";
import { View, Pressable, Platform } from "react-native";
import { Translate_text } from "../i18n/translate";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { Dialog_alert } from "../utils/dialog";
import {
  History_getPersonalRecords,
  History_totalRecordWeight,
  History_getStartedEntries,
  History_totalRecordReps,
  History_totalRecordSets,
  History_collectMuscleGroups,
  History_workoutTime,
} from "../models/history";
import { Rm1Formula_fromSettings } from "../models/rm1Formula";
import { Button } from "./button";
import { IHistoryRecord, IProgram, IScreenMuscle, ISettings, IStats } from "../types";
import { useNavOptions } from "../navigation/useNavOptions";
import { Thunk_maybeRequestReview, Thunk_maybeRequestSignup, Thunk_pushScreen } from "../ducks/thunks";
import { GroupHeader } from "./groupHeader";
import { HistoryEntryView } from "./historyEntry";
import { Collector } from "../utils/collector";
import { CollectionUtils_splitIntoNGroups } from "../utils/collection";
import { ObjectUtils_keys } from "../utils/object";
import { IconInstagram } from "./icons/iconInstagram";
import { WorkoutShareButton } from "./workoutShareButton";
import { IconKebab } from "./icons/iconKebab";
import { IconPicture } from "./icons/iconPicture";
import { ClipboardUtils_copy } from "../utils/clipboard";
import { IconTiktok } from "./icons/iconTiktok";
import { PersonalRecords } from "./personalRecords";
import { PersonalArtImage } from "../personal/personalArtImage";
import { n } from "../utils/math";
import { Muscle_getMuscleGroupName } from "../models/muscle";
import { IconDoc } from "./icons/iconDoc";
import { LiftohistorySerializer_serialize } from "../liftohistory/liftohistorySerializer";
import { navigateToModal } from "../navigation/navigationService";

interface IProps {
  history: IHistoryRecord[];
  historyRecordId?: number;
  settings: ISettings;
  userId?: string;
  dispatch: IDispatch;
  stats: IStats;
  allPrograms: IProgram[];
  currentProgramId?: string;
}

export function ScreenFinishDay(props: IProps): JSX.Element {
  useNavOptions({ navTitle: "Congratulations!" });

  const recordById =
    props.historyRecordId != null ? props.history.find((h) => h.id === props.historyRecordId) : undefined;
  const record = recordById ?? props.history[0];

  // On the very first workout, history is momentarily empty between the
  // navigate-to-finishDay and the FinishProgramDayAction commit, so `record`
  // is undefined for one render until the committed record arrives.
  if (record == null) {
    return <></>;
  }

  const allPrs = History_getPersonalRecords(props.history, Rm1Formula_fromSettings(props.settings));
  const totalWeight = History_totalRecordWeight(record, props.settings);

  const startedEntries = History_getStartedEntries(record);
  const totalReps = History_totalRecordReps(record);
  const totalSets = History_totalRecordSets(record);

  const historyCollector = Collector.build([record]).addFn(History_collectMuscleGroups(props.settings));
  const [muscleGroupsData] = historyCollector.run();
  const muscleGroups = ObjectUtils_keys(muscleGroupsData).reduce<[IScreenMuscle, number][]>((memo, mg) => {
    const values = muscleGroupsData[mg];
    if (values[2][0] > 0 && mg !== "total") {
      memo.push([mg, values[2][0]]);
    }
    return memo;
  }, []);
  muscleGroups.sort((a, b) => b[1] - a[1]);
  const muscleGroupsGrouped = CollectionUtils_splitIntoNGroups(muscleGroups, 2);
  const eligibleForCreateProgramDay = props.allPrograms.every((p) => p.id !== record.programId);

  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <>
      <View className="px-gutter pb-6">
        {/* personal-fork: mascot and confetti removed, art slot in src/personal/art.ts */}
        <PersonalArtImage slot="finishDay" className="flex-row items-center justify-center pt-6 pb-6" />
        <View className="items-center px-gutter pb-2">
          <Text className="text-sm text-text-secondary">{record.programName}</Text>
          <Text className="text-base">{record.dayName}</Text>
        </View>
        {/* personal-fork: records first, then a label-and-number table, flat surfaces with 1px lines */}
        <View className="px-4 py-3 mt-2 border rounded-lg border-border-neutral">
          <PersonalRecords prs={allPrs} historyRecords={[record]} settings={props.settings} />
        </View>
        <View className="mt-2 border rounded-lg border-border-neutral" testID="totals-summary">
          <View className="px-4 pt-2">
            <GroupHeader name="Totals" />
          </View>
          <View className="flex-row border-b border-border-neutral">
            <FinishStat label="Time" value={PersonalFormat_duration(History_workoutTime(record))} />
            <FinishStat label="Volume" value={PersonalFormat_volume(totalWeight)} testID="totals-summary-volume" />
          </View>
          <View className="flex-row">
            <FinishStat label="Sets" value={`${totalSets}`} />
            <FinishStat label="Reps" value={`${totalReps}`} />
          </View>
        </View>

        {startedEntries.length > 0 && (
          <View className="px-4 py-2 mt-2 rounded-lg bg-background-surface" testID="completed-exercises">
            <GroupHeader name="Exercises" />
            {startedEntries.map((entry, i) => {
              return (
                <HistoryEntryView
                  key={`${entry.exercise.id}_${entry.exercise.equipment}`}
                  showNotes={false}
                  entry={entry}
                  isNext={false}
                  isLast={i === startedEntries.length - 1}
                  settings={props.settings}
                />
              );
            })}
          </View>
        )}

        <View className="px-4 py-2 mt-2 border rounded-lg border-border-neutral" testID="sets-per-muscle-group">
          <GroupHeader name="Sets per muscle group" />
          <View className="flex-row gap-4">
            {muscleGroupsGrouped.map((group, gi) => {
              return (
                <View key={gi} className="flex-1">
                  {group.map(([mg, value]) => {
                    return (
                      <Text key={mg} className="text-sm">
                        {Muscle_getMuscleGroupName(mg, props.settings)}
                        {StringUtils_colonSpace()}
                        <Text className="font-bold" style={{ fontVariant: ["tabular-nums"] }}>
                          {n(value)}
                        </Text>
                      </Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {isMobile ? (
          <MobileShare userId={props.userId} history={props.history} record={record} settings={props.settings} />
        ) : (
          <WebappShare userId={props.userId} history={props.history} record={record} settings={props.settings} />
        )}

        {eligibleForCreateProgramDay && (
          <Text className="mx-2 my-1 text-xs text-text-secondary">You can create a program day from this workout</Text>
        )}

        <View className="flex-row w-full gap-4 pt-4">
          {eligibleForCreateProgramDay && (
            <View className="items-center flex-1">
              <Button
                name="create-program-day"
                kind="purple"
                buttonSize="lg2"
                className="w-36"
                testID="create-program-day"
                onPress={() => {
                  navigateToModal("dayFromAdhocModal", { historyRecordId: record.id });
                }}
              >
                Create Program Day
              </Button>
            </View>
          )}
          <View className="items-center justify-center flex-1 pb-8">
            <Button
              name="finish-day-continue"
              kind="purple"
              className="w-36"
              testID="finish-day-continue"
              onPress={() => {
                props.dispatch(Thunk_pushScreen("main", undefined, { tab: "home" }));
                props.dispatch(Thunk_maybeRequestReview());
                props.dispatch(Thunk_maybeRequestSignup());
              }}
            >
              Continue
            </Button>
          </View>
        </View>
      </View>
    </>
  );
}

function FinishStat(props: { label: string; value: string; testID?: string }): JSX.Element {
  return (
    <View className="flex-1 px-4 py-2">
      <Text noTranslate={true} className="text-xs text-text-secondary">
        {PersonalFormat_statLabel(props.label)}
      </Text>
      <Text
        noTranslate={true}
        testID={props.testID}
        data-testid={props.testID}
        className="font-bold"
        style={{ fontSize: 20, lineHeight: 26, fontVariant: ["tabular-nums"] }}
      >
        {props.value}
      </Text>
    </View>
  );
}

interface IMobileShareProps {
  history: IHistoryRecord[];
  record: IHistoryRecord;
  settings: ISettings;
  userId?: string;
}

function MobileShare(props: IMobileShareProps): JSX.Element {
  const historyRecordId = props.record.id;
  return (
    <View className="px-gutter py-4">
      <GroupHeader name="Share it!" />
      <View className="flex-row justify-between gap-4">
        <View className="items-center">
          <Pressable
            testID="finish-day-share-igstory"
            className="nm-finishday-share-igstory"
            onPress={() => navigateToModal("socialShareModal", { type: "igstory", historyRecordId })}
          >
            <IconInstagram />
          </Pressable>
          <Text className="text-xs text-text-secondary">IG Story</Text>
        </View>
        <View className="items-center">
          <Pressable
            testID="finish-day-share-igfeed"
            className="nm-finishday-share-igfeed"
            onPress={() => navigateToModal("socialShareModal", { type: "igfeed", historyRecordId })}
          >
            <IconInstagram />
          </Pressable>
          <Text className="text-xs text-text-secondary">IG Feed</Text>
        </View>
        <View className="items-center">
          <Pressable
            testID="finish-day-share-tiktok"
            className="nm-finishday-share-tiktok"
            onPress={() => navigateToModal("socialShareModal", { type: "tiktok", historyRecordId })}
          >
            <IconTiktok />
          </Pressable>
          <Text className="text-xs text-text-secondary">Tiktok</Text>
        </View>
        <View className="items-center">
          <Pressable
            testID="finish-day-share-text"
            className="items-center justify-center w-scaled-10 h-scaled-10 rounded-full nm-finishday-share-text bg-background-subtle"
            onPress={() => {
              const text = LiftohistorySerializer_serialize(props.record, props.settings);
              ClipboardUtils_copy(text);
              Dialog_alert(Translate_text("Copied!"));
            }}
          >
            <IconDoc />
          </Pressable>
          <Text className="text-xs text-text-secondary">Text</Text>
        </View>
        <View className="items-center">
          <WorkoutShareButton
            history={props.history}
            record={props.record}
            settings={props.settings}
            icon={<IconKebab />}
          />
          <Text className="text-xs text-text-secondary">More</Text>
        </View>
      </View>
      {/* personal-fork: needs liftosaur.com server */}
    </View>
  );
}

interface IWebappShareProps {
  history: IHistoryRecord[];
  record: IHistoryRecord;
  userId?: string;
  settings: ISettings;
}

function WebappShare(props: IWebappShareProps): JSX.Element {
  return (
    <View className="px-gutter py-4">
      <GroupHeader name="Share it!" />
      <View className="flex-row justify-between gap-4">
        <View className="items-center">
          <WorkoutShareButton
            history={props.history}
            record={props.record}
            settings={props.settings}
            icon={<IconPicture />}
          />
          <Text className="text-xs text-text-secondary">Image</Text>
        </View>
        <View className="items-center">
          <Pressable
            testID="finishday-share-text"
            className="items-center justify-center w-scaled-10 h-scaled-10 rounded-full bg-background-subtle"
            onPress={() => {
              const text = LiftohistorySerializer_serialize(props.record, props.settings);
              ClipboardUtils_copy(text);
              Dialog_alert(Translate_text("Copied!"));
            }}
          >
            <IconDoc />
          </Pressable>
          <Text className="text-xs text-text-secondary">Text</Text>
        </View>
        {/* personal-fork: needs liftosaur.com server */}
      </View>
    </View>
  );
}
