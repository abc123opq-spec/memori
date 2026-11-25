import { ExerciseDisplayName_equipment } from "../i18n/exerciseDisplayName";
import { StringUtils_joinNames } from "../utils/string";
import { Translate_format } from "../i18n/translate";
import { JSX, memo, useState, useCallback, useMemo } from "react";
import { useTimedMemo } from "../utils/useTimedMemo";
import { usePerfScrollMarkers } from "../utils/usePerfScrollMarkers";
import { View, Pressable, ScrollView } from "react-native";
import { LegendList } from "@legendapp/list";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { IProgram, ISettings } from "../types";
import {
  builtinProgramAges,
  builtinProgramDurations,
  builtinProgramFrequencies,
  builtinProgramGoals,
} from "../models/builtinPrograms";
import { IProgramFilter, IProgramSort, ProgramFilter_sort, ProgramFilter_filter } from "../utils/programFilter";
import { SelectLink } from "./selectLink";
import { ExerciseImageUtils_exists } from "../models/exerciseImage";
import { IProgramIndexEntry, Program_exerciseRangeFormat, Program_joinParts } from "../models/program";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { ExerciseImage } from "./exerciseImage";
import { IconArrowRight } from "./icons/iconArrowRight";
import { ProgramListMeta_durationLabel } from "../models/programListMeta";
import { IconCalendarSmall } from "./icons/iconCalendarSmall";
import { IconKettlebellSmall } from "./icons/iconKettlebellSmall";
import { IconWatch } from "./icons/iconWatch";
import { Equipment_currentEquipment } from "../models/equipment";
import { navigateToModal } from "../navigation/navigationService";
import { SimpleMarkdown } from "./simpleMarkdown";
import { useRemScale } from "../utils/useRem";

interface IProps {
  programs: IProgram[];
  programsIndex: IProgramIndexEntry[];
  hasCustomPrograms: boolean;
  settings: ISettings;
  dispatch: IDispatch;
  search?: string;
}

export function BuiltinProgramsList(props: IProps): JSX.Element {
  const [filter, setFilter] = useState<IProgramFilter>({});
  const [sort, setSort] = useState<IProgramSort>(undefined);
  const searchLower = (props.search || "").toLowerCase();
  const filtered = useTimedMemo(
    "builtinPrograms.filtered",
    () => ProgramFilter_sort(ProgramFilter_filter(props.programsIndex, filter), sort),
    [props.programsIndex, filter, sort]
  );
  const entries = useTimedMemo(
    "builtinPrograms.searched",
    () => (searchLower ? filtered.filter((e) => e.name.toLowerCase().includes(searchLower)) : filtered),
    [filtered, searchLower]
  );

  const { settings, hasCustomPrograms } = props;
  const renderItem = useCallback(
    ({ item }: { item: IProgramIndexEntry }) => (
      <BuiltInProgram entry={item} settings={settings} hasCustomPrograms={hasCustomPrograms} />
    ),
    [settings, hasCustomPrograms]
  );

  const keyExtractor = useCallback((item: IProgramIndexEntry) => item.id, []);

  // personal-fork: filters as a row of chips and a count line, as in the instrument mock
  const listHeader = (
    <View className="pt-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <SelectLink
          name="builtin-filter-age"
          chipLabel="Age"
          values={builtinProgramAges}
          onChange={(age) => setFilter({ ...filter, age })}
          emptyLabel="any time"
          value={filter.age}
        />
        <SelectLink
          name="builtin-filter-frequency"
          chipLabel="Frequency"
          values={builtinProgramFrequencies}
          onChange={(frequency) => setFilter({ ...filter, frequency })}
          emptyLabel="any number days a week"
          value={filter.frequency}
        />
        <SelectLink
          name="builtin-filter-duration"
          chipLabel="Duration"
          values={builtinProgramDurations}
          onChange={(duration) => setFilter({ ...filter, duration })}
          emptyLabel="any time"
          value={filter.duration}
        />
        <SelectLink
          name="builtin-filter-goal"
          chipLabel="Goal"
          values={builtinProgramGoals}
          onChange={(goal) => setFilter({ ...filter, goal })}
          emptyLabel="strength or hypertrophy"
          value={filter.goal}
        />
      </ScrollView>
      <View className="flex-row items-center justify-between gap-2 py-3 border-b border-border-line">
        <Text className="text-sm text-text-secondary" style={{ fontVariant: ["tabular-nums"] }}>
          {Translate_format("{n} programs", { n: entries.length })}
        </Text>
        <SelectLink
          name="builtin-sort"
          chipLabel="Sort by"
          values={{ age: "Age", frequency: "Frequency", duration: "Duration" }}
          onChange={(v) => setSort(v)}
          emptyLabel="None"
          value={sort}
        />
      </View>
    </View>
  );

  const listEmpty = (
    <View className="py-10">
      <Text className="text-base text-center text-text-secondary">No programs found with selected filters</Text>
    </View>
  );

  const scrollMarkers = usePerfScrollMarkers("BuiltinProgramsList");
  const remScale = useRemScale();
  return (
    <LegendList
      style={{ flex: 1 }}
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      // LegendList never grows totalSize past the items it has measured, so an estimate below the
      // real average makes the tail of the list unreachable - it must err on the high side.
      estimatedItemSize={260 * remScale}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      onScrollBeginDrag={scrollMarkers.onScrollBeginDrag}
      onScrollEndDrag={scrollMarkers.onScrollEndDrag}
      onMomentumScrollEnd={scrollMarkers.onMomentumScrollEnd}
    />
  );
}

interface IBuiltInProgramProps {
  entry: IProgramIndexEntry;
  settings: ISettings;
  hasCustomPrograms: boolean;
}

const BuiltInProgram = memo(function BuiltInProgram(props: IBuiltInProgramProps): JSX.Element {
  const { entry, hasCustomPrograms } = props;
  const allEquipment = useMemo(() => Equipment_currentEquipment(props.settings), [props.settings]);
  const equipment = useMemo(
    () => (entry.equipment ?? []).map((e) => ExerciseDisplayName_equipment(e, allEquipment)),
    [entry.equipment, allEquipment]
  );
  const exercisesRange = entry.exercisesRange;
  const numberOfWeeks = entry.weeksCount ?? 0;
  const onPress = useCallback(() => {
    navigateToModal("programInfoModal", { programId: entry.id, hasCustomPrograms });
  }, [entry.id, hasCustomPrograms]);
  const visibleExercises = useMemo(
    () => (entry.exercises ?? []).filter((e) => ExerciseImageUtils_exists(e, "small")),
    [entry.exercises]
  );
  const remScale = useRemScale();
  const metaStyle = { fontSize: 13 * remScale, lineHeight: 20 * remScale, fontVariant: ["tabular-nums" as const] };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry.name}
      className="flex-row items-center w-full gap-2 py-4 border-b border-border-line"
      onPress={onPress}
      data-testid="program-list-choose-program"
      testID="program-list-choose-program"
    >
      {/* personal-fork: a line-separated row with a meta line, as in the instrument mock */}
      <View className="flex-1">
        <Text className="font-bold text-text-primary" style={{ fontSize: 17 * remScale, lineHeight: 24 * remScale }}>
          {entry.name}
        </Text>
        {entry.shortDescription && (
          <SimpleMarkdown value={entry.shortDescription} className="mt-1 text-sm text-text-secondary" />
        )}
        {visibleExercises.length > 0 && (
          <View className="flex-row flex-wrap pb-2">
            {visibleExercises.map((e) => (
              <ExerciseImage
                key={`${e.id}_${e.equipment}`}
                settings={props.settings}
                exerciseType={e}
                size="small"
                className="w-scaled-6 mr-1"
              />
            ))}
          </View>
        )}
        <View className="flex-row flex-wrap items-center mt-2" style={{ columnGap: 14, rowGap: 4 }}>
          {entry.duration && (
            <View className="flex-row items-center gap-1">
              <IconWatch width={12} height={15} color={Tailwind_semantic().text.ink3} />
              <Text className="text-text-secondary" style={metaStyle}>
                {ProgramListMeta_durationLabel(entry.duration)}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <IconCalendarSmall size={15} color={Tailwind_semantic().text.ink3} />
            <Text className="text-text-secondary" style={metaStyle}>
              {Program_joinParts([
                numberOfWeeks > 1 ? Translate_format("{n} weeks", { n: numberOfWeeks }) : "",
                entry.frequency ? Translate_format("{n}x/week", { n: entry.frequency }) : "",
                exercisesRange ? Program_exerciseRangeFormat(exercisesRange[0], exercisesRange[1]) : "",
              ])}
            </Text>
          </View>
          {equipment.length > 0 && (
            <View className="flex-row items-center gap-1">
              <IconKettlebellSmall size={15} color={Tailwind_semantic().text.ink3} />
              <Text className="text-text-secondary" style={metaStyle}>
                {StringUtils_joinNames(equipment)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <IconArrowRight color={Tailwind_semantic().text.ink3} width={8} height={14} />
    </Pressable>
  );
});
