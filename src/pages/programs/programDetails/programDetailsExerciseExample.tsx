import { JSX, Fragment, useState } from "react";
import { HistoryRecordSetsView } from "../../../components/historyRecordSets";
import { Input } from "../../../components/input";
import { Scroller } from "../../../components/scroller";
// personal-fork: the in-app guide shows this block, so its labels and names go through the ja dictionary
import { Translate_format, Translate_text } from "../../../i18n/translate";
import { ExerciseDisplayName_equipment, ExerciseDisplayName_name } from "../../../i18n/exerciseDisplayName";
import { Exercise_get, Exercise_onerm, Exercise_toKey, Exercise_getIsUnilateral } from "../../../models/exercise";
import { IEvaluatedProgram, Program_getProgramDayExercises, Program_nextHistoryEntry } from "../../../models/program";
import { IExerciseType, IHistoryEntry, ISettings, IWeight } from "../../../types";
import { ProgramDetailsExerciseExampleGraph } from "./programDetailsExerciseExampleGraph";
import { Weight_build } from "../../../models/weight";
import { PP_iterate2 } from "../../../models/pp";
import { CollectionUtils_compact, CollectionUtils_findBy } from "../../../utils/collection";
import { PlannerProgramExercise_toUsed } from "../../planner/models/plannerProgramExercise";
import { Stats_getEmpty } from "../../../models/stats";
import { Progress_getEntryId } from "../../../models/progress";
import { UidFactory_generateUid } from "../../../utils/generator";
import { PersonalUnits_exampleWeekLabel } from "../../../models/personalUnits";

export interface IProgramDetailsExerciseExampleProps {
  settings: ISettings;
  program: IEvaluatedProgram;
  exerciseType: IExerciseType;
  programExerciseKey: string;
  weekSetup?: { name?: string; weekIndex?: number }[];
  defaultOnerm?: number;
}

export function ProgramDetailsExerciseExample(props: IProgramDetailsExerciseExampleProps): JSX.Element {
  const exerciseType = props.exerciseType;
  const exercise = Exercise_get(exerciseType, props.settings.exercises);
  let dayInWeek: number | undefined;
  const weekSetup =
    props.weekSetup ||
    props.program.weeks.map((w, i) => ({
      name: PersonalUnits_exampleWeekLabel(w.name, undefined, props.settings.units),
      weekIndex: i,
    }));
  PP_iterate2(props.program.weeks, (ex, weekIndex, dayInWeekIndex, dayIndex) => {
    if (ex.key === props.programExerciseKey) {
      dayInWeek = dayInWeekIndex + 1;
      return true;
    }
    return false;
  });
  dayInWeek = dayInWeek ?? 1;

  const defaultOnerm = props.defaultOnerm
    ? Weight_build(props.defaultOnerm, props.settings.units)
    : Exercise_onerm(props.exerciseType, props.settings);
  const [onerm, setOnerm] = useState<IWeight>(defaultOnerm);
  const settings = {
    ...props.settings,
    exerciseData: { ...props.settings.exerciseData, [Exercise_toKey(props.exerciseType)]: { rm1: onerm } },
  };
  const weekEntries = CollectionUtils_compact(
    weekSetup.map((w, i) => {
      const weekIndex = w.weekIndex ?? i;
      const week = props.program.weeks[weekIndex];
      const programDay = week.days[(dayInWeek ?? 1) - 1];
      const dayExercises = Program_getProgramDayExercises(programDay);
      const programExercise = PlannerProgramExercise_toUsed(
        CollectionUtils_findBy(dayExercises, "key", props.programExerciseKey)
      );
      const entry: IHistoryEntry = programExercise
        ? Program_nextHistoryEntry(
            props.program,
            programDay.dayData,
            weekIndex,
            programExercise,
            Stats_getEmpty(),
            settings
          )
        : {
            vtype: "history_entry",
            id: Progress_getEntryId(exerciseType, programExercise),
            exercise: exerciseType,
            index: weekIndex,
            warmupSets: [],
            sets: [
              {
                id: UidFactory_generateUid(6),
                vtype: "set",
                index: 0,
                isUnilateral: Exercise_getIsUnilateral(exerciseType, settings),
                originalWeight: Weight_build(0, settings.units),
                weight: Weight_build(0, settings.units),
                reps: 0,
              },
            ],
          };

      return { label: w.name ?? week.name, entry };
    })
  );

  return (
    <div>
      <div className="mx-auto mt-2">
        <div className="w-48 mx-auto mb-2">
          <Input
            label={Translate_format("Enter 1RM weight ({unit})", { unit: onerm.unit })}
            value={onerm.value}
            changeHandler={(r) => {
              if (r.success) {
                const value = parseFloat(r.data);
                if (!isNaN(value)) {
                  setOnerm(Weight_build(value, props.settings.units));
                }
              }
            }}
          />
        </div>
        <div className="relative flex-1 px-2 mx-auto rounded-lg bg-background-purpledark">
          <div className="items-start block sm:flex sm:items-center">
            {/* personal-fork: no exercise photos, so the image column is gone */}
            <div className="flex pt-2 pl-2" style={{ minWidth: "4rem", maxWidth: "16rem" }}>
              <div className="flex-1 ml-auto">
                <div className="flex items-center">
                  <div className="flex-1 mr-1 font-bold">{ExerciseDisplayName_name(exercise)}</div>
                </div>
                {exercise.equipment && (
                  <div className="text-sm text-text-secondary">{ExerciseDisplayName_equipment(exercise.equipment)}</div>
                )}
              </div>
            </div>
            <Scroller>
              <section className="relative flex items-center mt-1 ml-2">
                {weekEntries.map((week, i) => {
                  return (
                    <Fragment key={i}>
                      {i !== 0 && <div className="h-12 mr-2 border-l border-border-neutral" />}
                      <div>
                        <div className="px-2 text-xs text-center whitespace-nowrap text-text-secondary">
                          {week.label}
                        </div>
                        <div className="flex flex-no-wrap justify-center">
                          <HistoryRecordSetsView sets={week.entry.sets} isNext={true} units={props.settings.units} />
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </section>
            </Scroller>
          </div>
        </div>
        <div className="mb-2">
          <ProgramDetailsExerciseExampleGraph
            weeksData={weekEntries}
            key={onerm.value}
            title={Translate_text("Weight week over week")}
            yAxisLabel={Translate_text("Weight")}
            color="red"
            getValue={(entry) => entry.sets[0].weight?.value ?? 0}
          />
        </div>
        <div>
          <ProgramDetailsExerciseExampleGraph
            weeksData={weekEntries}
            key={onerm.value}
            title={Translate_text("Volume (reps * weight) week over week")}
            yAxisLabel={Translate_text("Volume")}
            color="orange"
            getValue={(entry) => entry.sets.reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight?.value ?? 0), 0)}
          />
        </div>
      </div>
    </div>
  );
}
