import { JSX, memo, useMemo } from "react";
import { View, Pressable, Platform } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { DateUtils_format } from "../utils/date";
import { TimeUtils_formatHOrMin } from "../utils/time";
import { Progress_isCurrent, Progress_isFullyEmptySet, Progress_getSupersetToColor } from "../models/progress";
import { ComparerUtils_noFns } from "../utils/comparer";
import { IHistoryRecord, ISettings, IWeight } from "../types";
import {
  IPersonalRecords,
  History_workoutTime,
  History_totalRecordWeight,
  History_totalRecordReps,
  History_totalRecordSets,
} from "../models/history";
import { IconWatch } from "./icons/iconWatch";
import { HistoryEntryView } from "./historyEntry";
import { PersonalFormat_recordTitle } from "../personal/format";
import { Button } from "./button";
import { Exercise_toKey } from "../models/exercise";
import { SimpleMarkdown } from "./simpleMarkdown";
import { StringUtils_pluralize } from "../utils/string";
import { n } from "../utils/math";
import { IEvaluatedProgramDay } from "../models/program";
import { Thunk_startProgramDay, Thunk_editHistoryRecord } from "../ducks/thunks";
import { IReactionSummary, Reactions_reactorsLine } from "../models/reactions";
import { ReactionBar } from "./social/reactionBar";
import { Translate_text } from "../i18n/translate";

interface IProps {
  historyRecord: IHistoryRecord;
  showTitle?: boolean;
  programDay?: IEvaluatedProgramDay;
  isOngoing: boolean;
  prs?: IPersonalRecords;
  settings: ISettings;
  reactions?: IReactionSummary;
  dispatch: IDispatch;
  hideStartButton?: boolean;
}

export function getNativeCardShadow(): Record<string, unknown> {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  }) as Record<string, unknown>;
}

export const HistoryRecordView = memo((props: IProps): JSX.Element => {
  const { historyRecord, dispatch } = props;
  const isCurrent = Progress_isCurrent(historyRecord);
  const recordTitle = PersonalFormat_recordTitle(historyRecord, isCurrent);
  const description = isCurrent ? props.programDay?.description : undefined;

  const entries = historyRecord.entries;
  const supersetToColor = useMemo(() => Progress_getSupersetToColor(entries), [entries]);

  const handleCardPress = (): void => {
    if (Progress_isCurrent(historyRecord)) {
      dispatch(Thunk_startProgramDay());
    } else {
      editHistoryRecord(
        historyRecord,
        dispatch,
        Progress_isCurrent(historyRecord) && Progress_isFullyEmptySet(historyRecord)
      );
    }
  };

  return (
    <View data-testid="history-record" testID="history-record" className="pt-2">
      {props.showTitle && (
        <Text
          data-testid="history-record-date"
          testID="history-record-date"
          className="mx-1 mb-1 text-base font-semibold"
        >
          {!isCurrent ? DateUtils_format(historyRecord.date) : props.isOngoing ? "Ongoing workout" : "Next workout"}
        </Text>
      )}
      {/* personal-fork: flat instrument card, surface for the next workout, 1px line for past ones */}
      <Pressable
        className={`rounded-lg px-4 bg-background-surface ${isCurrent ? "" : "border border-border-line"}`}
        onPress={handleCardPress}
      >
        <View className={isCurrent ? "pt-4 pb-2" : "py-4"}>
          <View className="pb-2">
            <View data-testid="history-record-program" testID="history-record-program">
              <Text noTranslate={true} className={isCurrent ? "text-xl font-bold" : "text-base font-semibold"}>
                {recordTitle.title}
              </Text>
              {recordTitle.subtitle !== "" && (
                <Text noTranslate={true} className="mt-0.5 text-sm text-text-secondary">
                  {recordTitle.subtitle}
                </Text>
              )}
            </View>
          </View>
          {description && (
            <View className="text-sm">
              <SimpleMarkdown value={description} />
            </View>
          )}
          <View data-testid="history-entry" testID="history-entry">
            {entries.map((entry, i) => {
              const isNext = isCurrent && Progress_isFullyEmptySet(historyRecord);
              const exerciseKey = Exercise_toKey(entry.exercise);
              const pr = props.prs?.[props.historyRecord.id]?.[exerciseKey] || undefined;
              return (
                <HistoryEntryView
                  key={i}
                  entry={entry}
                  prs={pr}
                  isOngoing={props.isOngoing}
                  isNext={isNext}
                  isInProgress={isCurrent && !isNext}
                  isLast={isNext && i === entries.length - 1}
                  supersetColor={entry.superset != null ? supersetToColor[entry.superset] : undefined}
                  settings={props.settings}
                  showNotes={true}
                />
              );
            })}
          </View>
          {!isCurrent && <HistoryRecordStats historyRecord={historyRecord} settings={props.settings} />}
          {historyRecord.notes && (
            <View className="mt-2">
              <Text>
                <Text className="text-sm">Note: </Text>
                <Text noTranslate={true} className="text-sm text-text-secondary">
                  {historyRecord.notes}
                </Text>
              </Text>
            </View>
          )}
          {props.reactions != null && props.reactions.total > 0 && (
            <View className="pt-3 mt-3 border-t border-border-cardpurple">
              <ReactionBar
                summary={props.reactions}
                canReact={false}
                tone="purple"
                onReact={() => undefined}
                testIdPrefix={`own-reaction-${historyRecord.id}`}
              />
              <Text className="mt-2 text-xs text-text-secondary">{Reactions_reactorsLine(props.reactions)}</Text>
            </View>
          )}
        </View>
      </Pressable>
      {isCurrent && !props.hideStartButton && (
        <View className="mt-3">
          {!props.isOngoing ? (
            <Button
              name="start-workout-button"
              data-testid="start-workout"
              testID="start-workout"
              kind="purple"
              buttonSize="lg2"
              className="w-full text-lg"
              onPress={handleCardPress}
            >
              Start workout
            </Button>
          ) : (
            <Button
              name="continue-workout-button"
              data-testid="start-workout"
              testID="start-workout"
              kind="purple"
              buttonSize="lg2"
              className="w-full text-lg"
              onPress={handleCardPress}
            >
              Continue workout
            </Button>
          )}
        </View>
      )}
    </View>
  );
}, ComparerUtils_noFns);

interface IHistoryRecordStats {
  historyRecord: IHistoryRecord;
  settings: ISettings;
}

function HistoryRecordStats(props: IHistoryRecordStats): JSX.Element {
  const record = props.historyRecord;
  return (
    <HistoryRecordStatsRow
      durationMs={History_workoutTime(record)}
      volume={History_totalRecordWeight(record, props.settings)}
      sets={History_totalRecordSets(record)}
      reps={History_totalRecordReps(record)}
    />
  );
}

export function HistoryRecordStatsRow(props: {
  durationMs: number;
  volume: IWeight;
  sets: number;
  reps: number;
}): JSX.Element {
  const { value: time, unit: timeUnit } = TimeUtils_formatHOrMin(props.durationMs);
  const totalWeight = props.volume;
  const totalReps = props.reps;
  const totalSets = props.sets;
  const setsUnit = StringUtils_pluralize("set", totalSets);
  const repsUnit = StringUtils_pluralize("rep", totalReps);

  return (
    <View className="flex-row justify-between mt-4">
      <HistoryRecordProperty
        icon={
          <View className="mb-1 mr-1">
            <IconWatch />
          </View>
        }
        value={time}
        hasPadding={true}
        unit={Translate_text(timeUnit, "duration")}
      />
      <HistoryRecordProperty value={n(totalWeight.value)} unit={totalWeight.unit} />
      <HistoryRecordProperty value={totalSets} hasPadding={true} unit={setsUnit} />
      <HistoryRecordProperty value={totalReps} hasPadding={true} unit={repsUnit} />
    </View>
  );
}

interface IHistoryRecordPropertyProps {
  icon?: JSX.Element;
  value: string | number;
  hasPadding?: boolean;
  unit?: string;
}

function HistoryRecordProperty(props: IHistoryRecordPropertyProps): JSX.Element {
  return (
    <View className="flex-row items-center">
      {props.icon}
      <Text className="text-base font-semibold">{props.value}</Text>
      {props.unit && (
        <Text className={`text-sm text-text-secondary ${props.hasPadding ? "ml-1" : ""}`}>{props.unit}</Text>
      )}
    </View>
  );
}

function editHistoryRecord(historyRecord: IHistoryRecord, dispatch: IDispatch, isNext: boolean): void {
  if (!isNext) {
    dispatch(Thunk_editHistoryRecord(historyRecord));
  }
}
