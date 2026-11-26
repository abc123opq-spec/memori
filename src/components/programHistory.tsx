import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTimedMemo } from "../utils/useTimedMemo";
import { usePerfScrollMarkers } from "../utils/usePerfScrollMarkers";
import { Platform, Pressable, ScrollView, TextStyle, View } from "react-native";
import { Text } from "./primitives/text";
import { DateUtils_format, DateUtils_formatDayMonth } from "../utils/date";
import { HomeSummary_frequency, HomeSummary_lastWorkout, HomeSummary_week } from "../models/homeSummary";
import { useRemScale } from "../utils/useRem";
import { Translate_format, Translate_text } from "../i18n/translate";
import { ISocialState, SocialState_homePage } from "../models/socialState";
import {
  FeedMerge_dateHeaderKeys,
  FeedMerge_ownFromDate,
  FeedMerge_rowDay,
  FeedMerge_rowKey,
  FeedMerge_rows,
  IFeedRow,
} from "../models/feedMerge";
import { FeedWorkout_key } from "../models/feedWorkout";
import { FeedWorkoutCard } from "./social/feedWorkoutCard";
import { useFocusEffect } from "@react-navigation/native";
import { Thunk_loadFeed, Thunk_loadOwnReactions, Thunk_react, Thunk_refreshFeedIfStale } from "../ducks/socialThunks";
import { Thunk_editHistoryRecord, Thunk_pushScreen, Thunk_startProgramDay } from "../ducks/thunks";
import { PastDay_buildRecord } from "../models/pastDayRecord";
import { Button } from "./button";
import { IconFilter } from "./icons/iconFilter";
import { LegendList, LegendListRef } from "@legendapp/list";
import { IDispatch } from "../ducks/types";
import { IProgram, IHistoryRecord, ISettings, ISubscription } from "../types";
import { INavCommon, IState, updateState } from "../models/state";
import { useNavOptions } from "../navigation/useNavOptions";
import { History_getHistoryRecordsForTimerange, History_getHomeAggregates } from "../models/history";
import { Rm1Formula_fromSettings } from "../models/rm1Formula";
import { WeekInsights } from "./weekInsights";
import { lb } from "lens-shmens";
import { WeekCalendar } from "./weekCalendar";
import { HistoryRecordsNullState } from "./historyRecordsNullState";
import { Progress_isCurrent } from "../models/progress";
import { Program_nextHistoryRecord } from "../models/program";
import { navigateToModal } from "../navigation/navigationService";
import { useTrackedState } from "../navigation/TrackedStateContext";
import { HistoryRecordView } from "./historyRecord";
import { HomeNextExercises } from "./homeNextExercises";
import { PersonalInstallHint } from "../personal/safetyNotes";
import { IProgramIndexEntry, Program_evaluate, Program_getProgramDay } from "../models/program";

interface IProps {
  program: IProgram;
  progress?: IHistoryRecord;
  history: IHistoryRecord[];
  settings: ISettings;
  subscription: ISubscription;
  navCommon: INavCommon;
  dispatch: IDispatch;
  initialHistoryRecordId?: number;
  social?: ISocialState;
  programsIndex?: IProgramIndexEntry[];
}

const ownReactionsWindow = 50;

export function getWeekHistory(
  history: IHistoryRecord[],
  firstDayOfWeek: number,
  startWeekFromMonday?: boolean
): IHistoryRecord[] {
  return History_getHistoryRecordsForTimerange(history, firstDayOfWeek, "week", startWeekFromMonday);
}

export function ProgramHistoryView(props: IProps): JSX.Element {
  const dispatch = props.dispatch;
  const aggregates = useTimedMemo(
    "programHistory.aggregates",
    () =>
      History_getHomeAggregates(
        props.history,
        !!props.settings.startWeekFromMonday,
        Rm1Formula_fromSettings(props.settings)
      ),
    [props.history, props.settings.startWeekFromMonday, props.settings.rm1formula]
  );
  const { sortedHistoryDesc, weeksData, prs } = aggregates;
  const { firstDayOfWeeks, historyRecordDateToFirstDayOfWeek, firstDayOfWeekToHistoryRecord } = weeksData;

  const sortedHistory = useTimedMemo(
    "programHistory.sortedHistory",
    () => {
      if (!props.progress && (!props.program || sortedHistoryDesc.length === 0)) {
        return sortedHistoryDesc;
      }
      const arr = sortedHistoryDesc.slice();
      if (props.progress) {
        arr.unshift(props.progress);
      } else if (props.program) {
        arr.unshift(Program_nextHistoryRecord(props.program, props.settings, props.navCommon.stats));
      }
      return arr;
    },
    [sortedHistoryDesc, props.progress, props.program, props.settings, props.navCommon.stats]
  );

  const firstNextRecord = useMemo(
    () =>
      sortedHistoryDesc.length === 0 && !props.progress
        ? Program_nextHistoryRecord(props.program, props.settings, props.navCommon.stats)
        : undefined,
    [sortedHistoryDesc, props.progress, props.program, props.settings, props.navCommon.stats]
  );

  const social = props.social;
  const userId = props.navCommon.userId;
  const homePage = social?.pages[SocialState_homePage];
  const hasFollowing = (social?.follows?.following.length ?? 0) > 0;
  const hasFollowers = (social?.follows?.followers.length ?? 0) > 0;
  const [ownFromDate, setOwnFromDate] = useState<string | undefined>(
    () => sortedHistoryDesc.find((r) => r.id === props.initialHistoryRecordId)?.date
  );
  const rows = useTimedMemo(
    "programHistory.rows",
    () => {
      const head = sortedHistory.length > sortedHistoryDesc.length ? sortedHistory[0] : undefined;
      const merged = FeedMerge_rows({
        own: sortedHistoryDesc,
        friendKeys: homePage?.keys ?? [],
        workouts: social?.workouts ?? {},
        hasMoreFriends: hasFollowing && (homePage?.hasMore ?? false),
        hiddenOwners: social?.hiddenOwners ?? [],
        selfId: userId,
        ownFromDate,
      });
      return head != null ? [{ kind: "own" as const, record: head }, ...merged] : merged;
    },
    [
      sortedHistory,
      sortedHistoryDesc,
      homePage,
      social?.workouts,
      social?.hiddenOwners,
      hasFollowing,
      userId,
      ownFromDate,
    ]
  );

  const dateHeaderKeys = useMemo(() => FeedMerge_dateHeaderKeys(rows, FeedMerge_rowKey, FeedMerge_rowDay), [rows]);

  useFocusEffect(
    useCallback(() => {
      if (userId != null) {
        dispatch(Thunk_refreshFeedIfStale(SocialState_homePage));
      }
    }, [userId])
  );

  useEffect(() => {
    if (Platform.OS === "web" && userId != null && hasFollowers) {
      dispatch(Thunk_loadOwnReactions(sortedHistoryDesc.slice(0, ownReactionsWindow).map((r) => r.id)));
    }
  }, [userId, hasFollowers, sortedHistoryDesc]);

  const [selectedFirstDayOfWeek, setSelectedWeekFirstDay] = useState(firstDayOfWeeks[firstDayOfWeeks.length - 1]);
  const previousWeekFirstDayDate = new Date(selectedFirstDayOfWeek);
  previousWeekFirstDayDate.setDate(previousWeekFirstDayDate.getDate() - 7);
  const previousWeekFirstDay = previousWeekFirstDayDate.getTime();
  const [selectedWeekCalendarFirstDayOfWeek, setSelectedWeekCalendarFirstDayOfWeek] = useState(selectedFirstDayOfWeek);

  const thisWeekHistory = useTimedMemo(
    "programHistory.thisWeekHistory",
    () => getWeekHistory(sortedHistory, selectedFirstDayOfWeek, props.settings.startWeekFromMonday),
    [sortedHistory, selectedFirstDayOfWeek, props.settings.startWeekFromMonday]
  );
  const lastWeekHistory = useTimedMemo(
    "programHistory.lastWeekHistory",
    () => getWeekHistory(sortedHistory, previousWeekFirstDay, props.settings.startWeekFromMonday),
    [sortedHistory, previousWeekFirstDay, props.settings.startWeekFromMonday]
  );
  const loadingItems = props.navCommon.loading.items;
  const loadingKeys = Object.keys(loadingItems).filter((k) => loadingItems[k]?.endTime == null);
  const isLoading = Object.keys(loadingKeys).length > 0;

  const evaluatedProgram = useTimedMemo(
    "programHistory.evaluatedProgram",
    () => Program_evaluate(props.program, props.settings),
    [props.program, props.settings]
  );
  const programDay = useMemo(
    () => Program_getProgramDay(evaluatedProgram, evaluatedProgram.nextDay),
    [evaluatedProgram]
  );
  const isOngoing = !!(props.progress && Progress_isCurrent(props.progress));
  const weekSummary = useMemo(
    () =>
      HomeSummary_week(
        sortedHistoryDesc,
        evaluatedProgram,
        Date.now(),
        !!props.settings.startWeekFromMonday,
        HomeSummary_frequency(props.program, props.programsIndex ?? [])
      ),
    [sortedHistoryDesc, evaluatedProgram, props.program, props.settings.startWeekFromMonday, props.programsIndex]
  );
  const lastWorkout = useMemo(() => HomeSummary_lastWorkout(sortedHistoryDesc), [sortedHistoryDesc]);
  const remScale = useRemScale();

  const flatListRef = useRef<LegendListRef>(null);
  const historyRecordDateToFirstDayOfWeekRef = useRef(historyRecordDateToFirstDayOfWeek);
  historyRecordDateToFirstDayOfWeekRef.current = historyRecordDateToFirstDayOfWeek;
  const selectedFirstDayOfWeekRef = useRef(selectedFirstDayOfWeek);
  selectedFirstDayOfWeekRef.current = selectedFirstDayOfWeek;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: IFeedRow }> }) => {
    const firstOwn = viewableItems.find((v) => v.item.kind === "own")?.item;
    if (firstOwn != null && firstOwn.kind === "own") {
      const firstVisibleRecord = firstOwn.record;
      const firstDayOfWeek = historyRecordDateToFirstDayOfWeekRef.current[firstVisibleRecord.id];
      if (firstDayOfWeek != null && firstDayOfWeek !== selectedFirstDayOfWeekRef.current) {
        setSelectedWeekFirstDay(firstDayOfWeek);
      }
    }
  }).current;

  const initialHistoryRecordId = props.initialHistoryRecordId;

  const [initialScrollIndex, setInitialScrollIndex] = useState(() => {
    if (initialHistoryRecordId == null) {
      return 0;
    }
    const idx = rows.findIndex((row) => row.kind === "own" && row.record.id === initialHistoryRecordId);
    return idx >= 0 ? idx : 0;
  });
  const [listRemountKey, setListRemountKey] = useState(0);

  const trackedState = useTrackedState();
  const scrollToRecordId = trackedState.scrollToHistoryRecordId;
  const [pendingScrollId, setPendingScrollId] = useState<number | undefined>(undefined);
  const [selectedPastDay, setSelectedPastDay] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (scrollToRecordId != null) {
      const target = sortedHistoryDesc.find((r) => r.id === scrollToRecordId);
      if (target != null) {
        updateState(
          props.dispatch,
          [lb<IState>().p("scrollToHistoryRecordId").record(undefined)],
          "Clear scroll target"
        );
        setOwnFromDate((current) => FeedMerge_ownFromDate(current, target.date));
        setPendingScrollId(scrollToRecordId);
      }
    }
  }, [scrollToRecordId, sortedHistoryDesc]);
  useEffect(() => {
    if (pendingScrollId == null) {
      return;
    }
    const index = rows.findIndex((row) => row.kind === "own" && row.record.id === pendingScrollId);
    if (index >= 0) {
      setPendingScrollId(undefined);
      setInitialScrollIndex(index);
      setListRemountKey((k) => k + 1);
    }
  }, [pendingScrollId, rows]);

  useNavOptions({ navHidden: true });

  const socialReactions = social?.reactions;
  const socialOwners = social?.owners;
  const homeSummary = useMemo(
    () => (
      <>
        {/* personal-fork: home's own start button, so the next-workout sheet keeps the only "start-workout" */}
        <View className="mt-3">
          <Button
            name="home-start-workout"
            testID="home-start-workout"
            data-testid="home-start-workout"
            kind="purple"
            buttonSize="lg2"
            className="w-full text-lg"
            onPress={() => dispatch(Thunk_startProgramDay())}
          >
            {isOngoing ? "Continue workout" : "Start workout"}
          </Button>
        </View>
        <HomeStats week={weekSummary} lastWorkout={lastWorkout} remScale={remScale} />
        <View className="mt-6 overflow-hidden rounded-lg">
          <WeekInsights
            dispatch={props.dispatch}
            prs={prs}
            selectedFirstDayOfWeek={selectedFirstDayOfWeek}
            thisWeekHistory={thisWeekHistory}
            lastWeekHistory={lastWeekHistory}
            settings={props.settings}
            subscription={props.subscription}
          />
        </View>
      </>
    ),
    [
      isOngoing,
      weekSummary,
      lastWorkout,
      remScale,
      prs,
      selectedFirstDayOfWeek,
      thisWeekHistory,
      lastWeekHistory,
      props.settings,
      props.subscription,
    ]
  );
  const renderItem = useCallback(
    ({ item }: { item: IFeedRow }) => {
      if (item.kind === "friend") {
        const workout = item.workout;
        return (
          <View className="mx-4 mb-6">
            <FeedWorkoutCard
              workout={workout}
              nickname={socialOwners?.[workout.ownerId]?.nickname}
              reactions={socialReactions?.[item.key]}
              settings={props.settings}
              showIdentity={true}
              showDate={dateHeaderKeys.has(item.key)}
              onOpenOwner={() => dispatch(Thunk_pushScreen("friendProfile", { userId: workout.ownerId }))}
              onReact={(reaction) => dispatch(Thunk_react(workout.ownerId, workout.recordId, reaction))}
            />
          </View>
        );
      }
      const isHead = Progress_isCurrent(item.record);
      return (
        <View className="mx-4 mb-6">
          <HistoryRecordView
            isOngoing={isOngoing}
            showTitle={!isHead && dateHeaderKeys.has(FeedMerge_rowKey(item))}
            programDay={programDay}
            prs={prs}
            settings={props.settings}
            historyRecord={item.record}
            reactions={userId != null ? socialReactions?.[FeedWorkout_key(userId, item.record.id)] : undefined}
            dispatch={dispatch}
            hideStartButton={isHead}
          />
          {isHead && homeSummary}
        </View>
      );
    },
    [
      isOngoing,
      programDay,
      prs,
      props.settings,
      dispatch,
      socialReactions,
      socialOwners,
      userId,
      dateHeaderKeys,
      homeSummary,
    ]
  );
  const listExtraData = useMemo(() => ({ renderItem }), [renderItem]);

  const keyExtractor = useCallback((item: IFeedRow) => FeedMerge_rowKey(item), []);

  const scrollMarkers = usePerfScrollMarkers("ProgramHistoryView");

  const header = (
    <View>
      {/* personal-fork: instrument home header, wordmark and date over the week strip */}
      <View className="px-4">
        <View className="flex-row items-center justify-between" style={{ minHeight: 44 }}>
          <Text noTranslate={true} className="text-base font-bold">
            Memori
          </Text>
          <Text noTranslate={true} className="text-sm text-text-secondary" style={{ fontVariant: ["tabular-nums"] }}>
            {DateUtils_format(Date.now(), false, true)}
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          className="mt-1 font-bold"
          style={{ fontSize: 28 * remScale, lineHeight: 35 * remScale }}
        >
          {isOngoing ? "Ongoing workout" : "Today's workout"}
        </Text>
        <PersonalInstallHint />
      </View>
      <View className="flex-row items-center mt-3">
        <View className="flex-1">
          <WeekCalendar
            startWeekFromMonday={props.settings.startWeekFromMonday}
            selectedWeekCalendarFirstDayOfWeek={selectedWeekCalendarFirstDayOfWeek}
            history={sortedHistory}
            firstDayOfWeekToHistoryRecord={firstDayOfWeekToHistoryRecord}
            firstDayOfWeeks={firstDayOfWeeks}
            isLoading={isLoading}
            selectedFirstDayOfWeek={selectedFirstDayOfWeek}
            onClick={() => navigateToModal("monthCalendarModal")}
            onSelectFirstDayOfWeek={(firstDayOfWeek) => {
              setSelectedWeekCalendarFirstDayOfWeek(firstDayOfWeek);
            }}
            selectedDay={selectedPastDay}
            onSelectDay={(day) => setSelectedPastDay(day === selectedPastDay ? undefined : day)}
          />
        </View>
        {hasFollowing && (
          <Pressable
            testID="feed-filter-button"
            data-testid="feed-filter-button"
            className="items-center justify-center mr-3 rounded-lg bg-background-cardpurple"
            style={{ width: 36, height: 36 }}
            onPress={() => dispatch(Thunk_pushScreen("feedFilter"))}
          >
            <IconFilter size={18} />
          </Pressable>
        )}
      </View>
      {/* personal-fork: a past day picked in the week strip can get a workout logged afterwards */}
      {selectedPastDay != null && (
        <View className="px-4 mt-2">
          <Pressable
            testID="home-add-past-workout"
            data-testid="home-add-past-workout"
            accessibilityRole="button"
            className="flex-row items-center justify-between px-4 border rounded-lg border-border-neutral"
            style={{ minHeight: 48 }}
            onPress={() => {
              setSelectedPastDay(undefined);
              dispatch(Thunk_editHistoryRecord(PastDay_buildRecord(selectedPastDay, Date.now())));
            }}
          >
            <Text className="text-base font-semibold">Add a workout for this day</Text>
            <Text noTranslate={true} className="text-sm text-text-secondary">
              {DateUtils_format(selectedPastDay, false, true)}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (rows.length === 0) {
    return (
      <ScrollView className="flex-1">
        {header}
        {/* personal-fork: before any history the next day is a plain card, so the sheet's record testIDs stay unique */}
        <View className="px-4 pb-6 mt-1">
          {programDay != null && programDay.name !== "" && (
            <View className="p-4 rounded-lg bg-background-surface" testID="home-next-day" data-testid="home-next-day">
              <Text noTranslate={true} className="text-xl font-bold">
                {programDay.name}
              </Text>
              <Text noTranslate={true} className="mt-0.5 text-sm text-text-secondary">
                {Translate_format("{program} · Week {week}", {
                  program: evaluatedProgram.name,
                  week: programDay.dayData.week,
                })}
              </Text>
              {firstNextRecord != null && (
                <HomeNextExercises entries={firstNextRecord.entries} settings={props.settings} />
              )}
            </View>
          )}
          {homeSummary}
          <HistoryRecordsNullState />
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1">
      <LegendList
        key={listRemountKey}
        ref={flatListRef}
        data={rows}
        renderItem={renderItem}
        ListHeaderComponent={header}
        extraData={listExtraData}
        keyExtractor={keyExtractor}
        estimatedItemSize={300}
        onEndReached={() => {
          if (hasFollowing) {
            dispatch(Thunk_loadFeed(SocialState_homePage, false));
          }
        }}
        initialScrollIndex={initialScrollIndex}
        waitForInitialLayout={true}
        onViewableItemsChanged={onViewableItemsChanged}
        onScrollBeginDrag={scrollMarkers.onScrollBeginDrag}
        onScrollEndDrag={scrollMarkers.onScrollEndDrag}
        onMomentumScrollEnd={scrollMarkers.onMomentumScrollEnd}
      />
    </View>
  );
}

interface IHomeStatsProps {
  week: { done: number; target?: number };
  lastWorkout?: number;
  remScale: number;
}

function HomeStats(props: IHomeStatsProps): JSX.Element {
  const valueStyle = { fontSize: 26 * props.remScale, lineHeight: 32 * props.remScale, fontVariant: ["tabular-nums"] };
  return (
    <View className="flex-row mt-6" testID="home-stats" data-testid="home-stats">
      <View className="flex-1">
        <Text className="text-sm text-text-secondary">This week</Text>
        <Text noTranslate={true} className="font-semibold" style={valueStyle as TextStyle}>
          {props.week.done}
          <Text noTranslate={true} className="text-sm font-medium text-text-ink3">
            {props.week.target != null
              ? ` ${Translate_format("/ {n} workouts", { n: props.week.target })}`
              : ` ${Translate_text("workouts done")}`}
          </Text>
        </Text>
      </View>
      <View className="flex-1 pl-4 border-l border-border-line">
        <Text className="text-sm text-text-secondary">Last workout</Text>
        <Text
          noTranslate={true}
          className={`font-semibold ${props.lastWorkout != null ? "" : "text-text-ink3"}`}
          style={valueStyle as TextStyle}
        >
          {props.lastWorkout != null ? DateUtils_formatDayMonth(props.lastWorkout) : "—"}
        </Text>
      </View>
    </View>
  );
}
