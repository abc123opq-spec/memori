import { JSX, useEffect, useRef, useState } from "react";
import { View, Pressable, Platform, Animated, useWindowDimensions } from "react-native";
import Reanimated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomKeyboardActiveId } from "../navigation/CustomKeyboardContext";
import { useActiveSheet } from "../navigation/ActiveSheetHeightContext";
import { useTrackedState } from "../navigation/TrackedStateContext";
import { Text } from "./primitives/text";
import { PersonalFormat_clock } from "../personal/format";
import { StringUtils_pad } from "../utils/string";
import { IDispatch } from "../ducks/types";
import { Thunk_playAudioNotification, Thunk_updateTimer, Thunk_checkSetTimer } from "../ducks/thunks";
import { IconTrash } from "./icons/iconTrash";
import { IconBack } from "./icons/iconBack";
import { IHistoryRecord, ISettings, ISubscription } from "../types";
import { Reps_findNextEntryAndSetIndex } from "../models/set";
import { Progress_getCurrentProgress } from "../models/progress";
import { useTrackClick } from "../utils/clickTracking";
import { useRem, useRemScale } from "../utils/useRem";
import { TEXT_SIZE_MAX } from "../models/settings";
import { RestTimerProgress_at } from "../models/restTimerProgress";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { RestTimerWidth_em } from "../models/restTimerWidth";

const TRANSITION_MS = 220;
// personal-fork: the band sits on top of the tab bar; this is the tab bar's height above the safe area
const REST_BAR_BOTTOM = 55;
const RestTimerLayoutTransition =
  Platform.OS === "web" ? undefined : LinearTransition.duration(TRANSITION_MS).easing(Easing.inOut(Easing.quad));
const RestTimerContentEntering = Platform.OS === "web" ? undefined : FadeIn.duration(TRANSITION_MS);
const RestTimerContentExiting = Platform.OS === "web" ? undefined : FadeOut.duration(TRANSITION_MS / 2);

function useRestTimerProgressStyle(
  timerSince: number | undefined,
  timer: number | undefined
): ReturnType<typeof useAnimatedStyle> {
  const fraction = useSharedValue(0);
  // No cancelAnimation in cleanup: scheduleOnUI runs after the next .value write, so it stopped the new rest at 0.
  useEffect(() => {
    if (timerSince == null || timer == null) {
      return;
    }
    const progress = RestTimerProgress_at(timerSince, timer, Date.now());
    fraction.value = progress.fraction;
    if (progress.remainingMs > 0) {
      fraction.value = withTiming(1, { duration: progress.remainingMs, easing: Easing.linear });
    }
  }, [timerSince, timer, fraction]);
  return useAnimatedStyle(() => ({ transform: [{ scaleX: fraction.value }] }));
}

function useRestTimerTick(isActive: boolean): void {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const intervalId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(intervalId);
  }, [isActive]);
}

export function RestTimer_formatCompact(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / 1000 / 60);
  return `${minutes}:${StringUtils_pad(seconds.toString(), 2)}`;
}

interface IProps {
  progress: IHistoryRecord;
  dispatch: IDispatch;
  subscription: ISubscription;
  settings: ISettings;
}

export function RestTimer(props: IProps): JSX.Element | null {
  const prevProps = useRef<IProps>(props);
  const sentNotification = useRef<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const trackClick = useTrackClick();
  const insets = useSafeAreaInsets();
  const keyboardActiveId = useCustomKeyboardActiveId();
  const { height: windowHeight } = useWindowDimensions();
  const activeSheet = useActiveSheet();
  const expandedSpacing = useRem() >= TEXT_SIZE_MAX ? 4 : 8;
  const remScale = useRemScale();
  const activeSheetHeight = activeSheet.height;
  // When the custom keyboard is open, the timer is shown inside it (see KeyboardRestTimer), so hide
  // the floating one here. We keep it mounted (not returning null) so the completion chirp still fires.
  const hideTimer = activeSheet.hidesFloatingUi || activeSheetHeight > windowHeight * 0.5 || keyboardActiveId != null;
  const baseBottom = insets.bottom + REST_BAR_BOTTOM;
  const targetBottom = Math.max(baseBottom, activeSheetHeight > 0 ? activeSheetHeight + 16 : 0);
  const animatedTargetBottom = useRef(new Animated.Value(targetBottom)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const wasHiddenRef = useRef(false);
  useEffect(() => {
    if (hideTimer) {
      animatedTargetBottom.setValue(targetBottom);
      animatedOpacity.setValue(0);
      wasHiddenRef.current = true;
    } else if (wasHiddenRef.current) {
      animatedTargetBottom.setValue(targetBottom);
      animatedOpacity.setValue(0);
      Animated.timing(animatedOpacity, { toValue: 1, duration: 200, useNativeDriver: false }).start();
      wasHiddenRef.current = false;
    } else {
      animatedOpacity.setValue(1);
      Animated.timing(animatedTargetBottom, {
        toValue: targetBottom,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [hideTimer, targetBottom, animatedTargetBottom, animatedOpacity]);
  const { progress } = props;
  const { timer, timerSince } = progress;

  useRestTimerTick(timerSince != null);
  const progressStyle = useRestTimerProgressStyle(timerSince, timer);

  useEffect(() => {
    if (timerSince != null) {
      const timeDifference = Date.now() - timerSince;
      const timerMs = timer != null ? timer * 1000 : 0;
      // Only play notification within 5s of completion; avoids repeat plays when syncing from another device past the threshold
      const maxNotificationWindowMs = 5000;
      if (
        timer != null &&
        timeDifference > timerMs &&
        timeDifference <= timerMs + maxNotificationWindowMs &&
        !sentNotification.current
      ) {
        if (!progress.ui?.nativeNotificationScheduled) {
          props.dispatch(Thunk_playAudioNotification());
        }
        sentNotification.current = true;
      } else if (timer != null && timeDifference > timerMs + maxNotificationWindowMs) {
        sentNotification.current = true;
      }
      // Reset on any deadline change (start time OR duration), so extending the timer re-arms the chirp
      const prevDeadline =
        (prevProps.current.progress.timerSince ?? 0) + (prevProps.current.progress.timer ?? 0) * 1000;
      const currDeadline = (props.progress.timerSince ?? 0) + (props.progress.timer ?? 0) * 1000;
      if (prevDeadline !== currDeadline) {
        sentNotification.current = false;
      }
    }
    prevProps.current = props;
  });

  // The corner rest timer shows the rest for `auto` timed sets. Poll the model each tick so it advances
  // to the next set's work window when the rest expires; a cheap no-op otherwise (Progress_checkSetTimer).
  useEffect(() => {
    if (timer == null || timerSince == null) {
      return;
    }
    props.dispatch(Thunk_checkSetTimer());
  });

  if (timer == null || timerSince == null) {
    return null;
  }
  const pointerEventsMode = hideTimer ? "none" : "box-none";

  const { elapsedMs, isTimeOut } = RestTimerProgress_at(timerSince, timer, Date.now());
  const elapsedText = PersonalFormat_clock(elapsedMs);
  const bgClass = isTimeOut ? "bg-background-darkred" : "bg-text-primary dark:bg-background-surface2";
  const totalColorClass = isTimeOut ? "text-white" : "text-gray-300";
  const nextEntryAndSetIndex =
    progress.timerEntryIndex != null && progress.timerMode != null
      ? Reps_findNextEntryAndSetIndex(progress, progress.timerEntryIndex, progress.timerMode)
      : undefined;
  const expanded = (
    <View className="flex-row items-center" style={{ gap: expandedSpacing, padding: expandedSpacing }}>
      <Pressable
        data-testid="rest-timer-minus"
        testID="rest-timer-minus"
        className="relative items-center justify-center px-1 min-w-scaled-10 min-h-scaled-10"
        onPress={() => {
          trackClick("rest-timer-minus");
          props.dispatch(
            Thunk_updateTimer(timer - 15, nextEntryAndSetIndex?.entryIndex, nextEntryAndSetIndex?.setIndex, false)
          );
        }}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.2 }} />
        <Text numberOfLines={1} className="font-bold text-text-alwayswhite" style={{ userSelect: "none" }}>
          -15s
        </Text>
      </Pressable>
      <Pressable
        data-testid="rest-timer-cancel"
        testID="rest-timer-cancel"
        className="relative items-center justify-center min-w-scaled-10 min-h-scaled-10"
        onPress={() => {
          trackClick("rest-timer-cancel");
          props.dispatch({ type: "StopTimer" });
        }}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.2 }} />
        {/* personal-fork: the trash button says what it does */}
        <View className="flex-row items-center px-2" style={{ gap: 4 }}>
          <IconTrash color="white" width={14} height={17} />
          <Text numberOfLines={1} className="text-xs font-semibold text-text-alwayswhite">
            Stop rest
          </Text>
        </View>
      </Pressable>
      <Pressable
        data-testid="rest-timer-expanded"
        testID="rest-timer-expanded"
        className="items-center justify-center flex-1"
        onPress={() => setIsExpanded(false)}
      >
        <Text
          numberOfLines={1}
          data-testid="rest-timer-current"
          className="text-2xl font-bold text-text-alwayswhite"
          style={{ userSelect: "none" }}
        >
          {elapsedText}
        </Text>
        <Text
          numberOfLines={1}
          data-testid="rest-timer-total"
          className={`text-sm ${totalColorClass}`}
          style={{ userSelect: "none" }}
        >
          {PersonalFormat_clock(timer * 1000)}
        </Text>
      </Pressable>
      <Pressable
        data-testid="rest-timer-back"
        testID="rest-timer-back"
        className="relative items-center justify-center min-w-scaled-10 min-h-scaled-10"
        onPress={() => setIsExpanded(false)}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.2 }} />
        <View style={{ transform: [{ rotate: "180deg" }] }}>
          <IconBack color="white" />
        </View>
      </Pressable>
      <Pressable
        data-testid="rest-timer-plus"
        testID="rest-timer-plus"
        className="relative items-center justify-center px-1 min-w-scaled-10 min-h-scaled-10"
        onPress={() => {
          trackClick("rest-timer-plus");
          props.dispatch(
            Thunk_updateTimer(timer + 15, nextEntryAndSetIndex?.entryIndex, nextEntryAndSetIndex?.setIndex, false)
          );
        }}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.2 }} />
        <Text numberOfLines={1} className="font-bold text-text-alwayswhite" style={{ userSelect: "none" }}>
          +15s
        </Text>
      </Pressable>
    </View>
  );

  const onMinus = (): void => {
    trackClick("rest-timer-minus");
    props.dispatch(
      Thunk_updateTimer(timer - 15, nextEntryAndSetIndex?.entryIndex, nextEntryAndSetIndex?.setIndex, false)
    );
  };
  const onPlus = (): void => {
    trackClick("rest-timer-plus");
    props.dispatch(
      Thunk_updateTimer(timer + 15, nextEntryAndSetIndex?.entryIndex, nextEntryAndSetIndex?.setIndex, false)
    );
  };
  const barText = isTimeOut ? "text-text-alwayswhite" : "text-text-primaryinverse dark:text-text-primary";

  // personal-fork: a full-width ink band above the tab bar, with -15s/+15s and an accent progress line
  const collapsed = (
    <View className="flex-row items-center pl-4 pr-2" style={{ minHeight: 64, gap: 8 }}>
      <Pressable
        data-testid="rest-timer-collapsed"
        testID="rest-timer-collapsed"
        accessibilityRole="button"
        onPress={() => {
          trackClick("rest-timer-expand");
          setIsExpanded(true);
        }}
        className="flex-row items-baseline flex-1"
        style={{ gap: 10, minHeight: 44, alignItems: "center" }}
      >
        <Text className={`text-sm ${barText}`} style={{ opacity: 0.8 }}>
          Rest
        </Text>
        <Text
          data-testid="rest-timer-current"
          numberOfLines={1}
          className={`font-semibold ${barText}`}
          style={{
            fontSize: 26 * remScale,
            minWidth: Math.ceil(RestTimerWidth_em(elapsedText) * 26 * remScale),
            userSelect: "none",
            fontVariant: ["tabular-nums"],
          }}
        >
          {elapsedText}
        </Text>
        <View className="flex-row items-center" style={{ opacity: 0.7 }}>
          <Text noTranslate={true} className={`text-sm ${barText}`}>
            /{" "}
          </Text>
          <Text data-testid="rest-timer-total" numberOfLines={1} className={`text-sm ${barText} whitespace-nowrap`}>
            {PersonalFormat_clock(timer * 1000)}
          </Text>
        </View>
      </Pressable>
      <Pressable
        data-testid="rest-timer-collapsed-minus"
        testID="rest-timer-collapsed-minus"
        accessibilityRole="button"
        className="relative items-center justify-center px-2.5 rounded-lg"
        style={{ minHeight: 44, minWidth: 52 }}
        onPress={onMinus}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.14 }} />
        <Text numberOfLines={1} className={`text-sm font-semibold ${barText}`} style={{ userSelect: "none" }}>
          -15s
        </Text>
      </Pressable>
      <Pressable
        data-testid="rest-timer-collapsed-plus"
        testID="rest-timer-collapsed-plus"
        accessibilityRole="button"
        className="relative items-center justify-center px-2.5 rounded-lg"
        style={{ minHeight: 44, minWidth: 52 }}
        onPress={onPlus}
      >
        <View className="absolute inset-0 rounded-lg bg-background-default" style={{ opacity: 0.14 }} />
        <Text numberOfLines={1} className={`text-sm font-semibold ${barText}`} style={{ userSelect: "none" }}>
          +15s
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: animatedTargetBottom,
        zIndex: 30,
        opacity: animatedOpacity,
      }}
      pointerEvents={pointerEventsMode}
    >
      <Reanimated.View layout={RestTimerLayoutTransition} className={bgClass}>
        {/* personal-fork: the expanded timer stays a full-width band; only its height changes */}
        <Reanimated.View layout={RestTimerLayoutTransition} style={{ overflow: "hidden" }}>
          <Reanimated.View
            layout={RestTimerLayoutTransition}
            pointerEvents="none"
            style={[
              { position: "absolute", left: 0, right: 0, top: 0 },
              { height: 3, opacity: isTimeOut ? 0 : 1 },
            ]}
          >
            <Reanimated.View
              style={[
                {
                  flex: 1,
                  backgroundColor: Tailwind_semantic().text.accent,
                  transformOrigin: "left",
                },
                progressStyle,
              ]}
            />
          </Reanimated.View>
          <Reanimated.View
            key={isExpanded ? "expanded" : "collapsed"}
            entering={RestTimerContentEntering}
            exiting={RestTimerContentExiting}
          >
            {isExpanded ? expanded : collapsed}
          </Reanimated.View>
        </Reanimated.View>
      </Reanimated.View>
    </Animated.View>
  );
}

export function KeyboardRestTimer(): JSX.Element | null {
  const state = useTrackedState();
  const progress = Progress_getCurrentProgress(state);
  const timer = progress?.timer;
  const timerSince = progress?.timerSince;
  useRestTimerTick(timerSince != null);

  if (timer == null || timerSince == null) {
    return null;
  }
  const { elapsedMs, isTimeOut } = RestTimerProgress_at(timerSince, timer, Date.now());
  return (
    <View pointerEvents="none" className="items-center absolute left-0 right-0 bottom-full mb-1">
      <Text
        data-testid="keyboard-rest-timer"
        testID="keyboard-rest-timer"
        numberOfLines={1}
        className={`text-xs font-bold ${isTimeOut ? "text-text-error" : "text-text-secondary"}`}
      >
        {RestTimer_formatCompact(elapsedMs)} /{RestTimer_formatCompact(timer * 1000)}
      </Text>
    </View>
  );
}
