import { ExerciseDisplayName_equipment } from "../i18n/exerciseDisplayName";
import { StringUtils_joinNames } from "../utils/string";
import { Translate_text } from "../i18n/translate";
import { JSX, memo, useCallback, useMemo } from "react";
import { View, Pressable } from "react-native";
import { LegendList } from "@legendapp/list";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { IEquipment, IHistoryRecord, IProgram, ISettings } from "../types";
import { IExercise, Exercise_find, Exercise_toKey } from "../models/exercise";
import { ExerciseImageUtils_exists } from "../models/exerciseImage";
import {
  Program_evaluate,
  Program_getAllUsedProgramExercises,
  Program_dayAverageTimeMs,
  Program_editAction,
  Program_selectProgramAndGoHome,
  Program_daysAndExercises,
} from "../models/program";
import { CollectionUtils_sort, CollectionUtils_nonnull } from "../utils/collection";
import { ObjectUtils_values } from "../utils/object";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { ProgramListMeta_durationLabel } from "../models/programListMeta";
import { ExerciseImage } from "./exerciseImage";
import { IconCalendarSmall } from "./icons/iconCalendarSmall";
import { IconKettlebellSmall } from "./icons/iconKettlebellSmall";
import { IconWatch } from "./icons/iconWatch";
import { Dialog_alert, Dialog_confirm } from "../utils/dialog";
import { IconEditSquare } from "./icons/iconEditSquare";
import { IconTrash } from "./icons/iconTrash";
import { EditProgram_deleteProgram } from "../models/editProgram";
import { useTimedMemo } from "../utils/useTimedMemo";
import { usePerfScrollMarkers } from "../utils/usePerfScrollMarkers";
import { Equipment_currentEquipment } from "../models/equipment";
import { useRemScale } from "../utils/useRem";
import { SocialState_programEditLine } from "../models/socialState";
import { IProgramEditsResponse } from "../models/friendProgram";
import { Thunk_pushScreen } from "../ducks/thunks";
import { ProgramGuideEntry } from "./programGuideEntry";

const MS_PER_MINUTE = 60000;

interface IProps {
  programs: IProgram[];
  progress?: IHistoryRecord;
  settings: ISettings;
  dispatch: IDispatch;
  search?: string;
  programEdits?: IProgramEditsResponse;
}

export function CustomProgramsList(props: IProps): JSX.Element {
  const searchLower = (props.search || "").toLowerCase();
  const sortedPrograms = useTimedMemo(
    "customPrograms.sorted",
    () => CollectionUtils_sort(props.programs, (a, b) => a.name.localeCompare(b.name)),
    [props.programs]
  );
  const programs = useTimedMemo(
    "customPrograms.filtered",
    () => (searchLower ? sortedPrograms.filter((p) => p.name.toLowerCase().includes(searchLower)) : sortedPrograms),
    [sortedPrograms, searchLower]
  );

  const { settings, progress, dispatch, programEdits } = props;
  const renderItem = useCallback(
    ({ item }: { item: IProgram }) => (
      <CustomProgram
        programs={sortedPrograms}
        settings={settings}
        progress={progress}
        program={item}
        dispatch={dispatch}
        programEdits={programEdits}
      />
    ),
    [sortedPrograms, settings, progress, dispatch, programEdits]
  );

  const keyExtractor = useCallback((item: IProgram) => item.id, []);
  const scrollMarkers = usePerfScrollMarkers("CustomProgramsList");
  const remScale = useRemScale();

  return (
    <LegendList
      style={{ flex: 1 }}
      data={programs}
      extraData={programEdits}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      // LegendList never grows totalSize past the items it has measured, so an estimate below the
      // real average makes the tail of the list unreachable - it must err on the high side.
      estimatedItemSize={240 * remScale}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      onScrollBeginDrag={scrollMarkers.onScrollBeginDrag}
      onScrollEndDrag={scrollMarkers.onScrollEndDrag}
      onMomentumScrollEnd={scrollMarkers.onMomentumScrollEnd}
    />
  );
}

interface ICustomProgramProps {
  programs: IProgram[];
  program: IProgram;
  progress?: IHistoryRecord;
  editProgramId?: string;
  settings: ISettings;
  dispatch: IDispatch;
  programEdits?: IProgramEditsResponse;
}

const CustomProgram = memo(function CustomProgram(props: ICustomProgramProps): JSX.Element {
  const { program, settings, programEdits } = props;
  const friendEditLine = useMemo(
    () => SocialState_programEditLine(programEdits, program.id, Date.now()),
    [programEdits, program.id]
  );
  const aggregates = useTimedMemo(
    "customPrograms.row",
    () => {
      const exerciseObj: Partial<Record<string, IExercise>> = {};
      const equipmentSet: Set<IEquipment | undefined> = new Set();
      const evaluatedProgram = Program_evaluate(program, settings);
      const allExercises = Program_getAllUsedProgramExercises(evaluatedProgram);
      for (const ex of allExercises) {
        const exercise = Exercise_find(ex.exerciseType, settings.exercises);
        if (exercise) {
          exerciseObj[Exercise_toKey(ex.exerciseType)] = exercise;
          if (exercise.equipment !== "bodyweight") {
            equipmentSet.add(exercise.equipment);
          }
        }
      }
      const exercises = CollectionUtils_nonnull(ObjectUtils_values(exerciseObj));
      const allEquipment = Equipment_currentEquipment(settings);
      const equipment = CollectionUtils_nonnull(Array.from(equipmentSet)).map((e) =>
        ExerciseDisplayName_equipment(e, allEquipment)
      );
      const time = Program_dayAverageTimeMs(evaluatedProgram, settings);
      const formattedTime =
        time > 0 ? ProgramListMeta_durationLabel(String(Math.round(time / MS_PER_MINUTE))) : undefined;
      const visibleExercises = exercises.filter((e) => ExerciseImageUtils_exists(e, "small"));
      return { evaluatedProgram, exercises, equipment, formattedTime, visibleExercises };
    },
    [program, settings]
  );
  const { evaluatedProgram, equipment, formattedTime, visibleExercises } = aggregates;

  const remScale = useRemScale();
  const metaStyle = { fontSize: 13 * remScale, lineHeight: 20 * remScale, fontVariant: ["tabular-nums" as const] };

  return (
    <View className="flex-row items-start w-full border-b border-border-line">
      {/* personal-fork: a line-separated row like the built-in list, actions in 44px buttons beside it */}
      <Pressable
        className="flex-1 py-4 pr-2"
        data-testid="program-list-choose-program"
        testID="program-list-choose-program"
        onPress={() => {
          if (props.program.planner == null) {
            Dialog_alert(Translate_text("Old-style programs are not supported anymore"));
          } else {
            Program_selectProgramAndGoHome(props.dispatch, props.program.id);
          }
        }}
      >
        <Text className="font-bold text-text-primary" style={{ fontSize: 17 * remScale, lineHeight: 24 * remScale }}>
          {props.program.name}
        </Text>
        {friendEditLine && (
          <Pressable
            className="flex-row items-center pt-1"
            testID={`program-friend-edits-${props.program.id}`}
            onPress={() => props.dispatch(Thunk_pushScreen("programEdits", { programId: props.program.id }))}
          >
            {friendEditLine.isUnseen && <View className="w-2 h-2 mr-1 rounded-full bg-background-error" />}
            <Text className="text-xs text-text-link">{friendEditLine.text} ›</Text>
          </Pressable>
        )}
        {visibleExercises.length > 0 && (
          <View className="flex-row flex-wrap pt-2">
            {visibleExercises.map((e) => (
              <ExerciseImage
                key={Exercise_toKey(e)}
                settings={props.settings}
                exerciseType={e}
                size="small"
                className="w-scaled-6 mr-1"
              />
            ))}
          </View>
        )}
        <View className="flex-row flex-wrap items-center mt-2" style={{ columnGap: 14, rowGap: 4 }}>
          {formattedTime && (
            <View className="flex-row items-center gap-1">
              <IconWatch width={12} height={15} color={Tailwind_semantic().text.ink3} />
              <Text className="text-text-secondary" style={metaStyle}>
                {formattedTime}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <IconCalendarSmall size={15} color={Tailwind_semantic().text.ink3} />
            <Text className="text-text-secondary" style={metaStyle}>
              {Program_daysAndExercises(evaluatedProgram)}
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
        <ProgramGuideEntry
          program={props.program}
          testID={`program-list-guide-open-${props.program.id}`}
          label="Read description"
        />
      </Pressable>
      <View className="flex-row items-center pt-2">
        <Pressable
          className="items-center justify-center"
          style={{ width: 44, height: 44 }}
          accessibilityRole="button"
          accessibilityLabel={Translate_text("Edit")}
          data-testid="custom-program-edit"
          testID="custom-program-edit"
          onPress={() => {
            if (props.editProgramId == null || props.editProgramId !== props.program.id) {
              Program_editAction(props.dispatch, props.program);
            } else {
              Dialog_alert(Translate_text("You cannot edit the program while that program's workout is in progress"));
            }
          }}
        >
          <IconEditSquare />
        </Pressable>
        <Pressable
          className="items-center justify-center"
          style={{ width: 44, height: 44 }}
          accessibilityRole="button"
          accessibilityLabel={Translate_text("Delete")}
          data-testid="custom-program-delete"
          testID="custom-program-delete"
          onPress={async () => {
            if (props.progress == null || props.progress.programId !== props.program.id) {
              if (await Dialog_confirm(Translate_text("Are you sure you want to delete this program?"))) {
                EditProgram_deleteProgram(props.dispatch, props.program, props.programs);
              }
            } else {
              Dialog_alert(Translate_text("You cannot delete the program while that program's workout is in progress"));
            }
          }}
        >
          <IconTrash />
        </Pressable>
      </View>
    </View>
  );
});
