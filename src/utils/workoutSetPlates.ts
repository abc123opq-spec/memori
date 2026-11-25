import { IExerciseType, ISet, ISettings, IWeight } from "../types";
import { Equipment_getEquipmentNameForExerciseType } from "../models/equipment";
import { Exercise_get } from "../models/exercise";
import { Weight_realizeLoad, Weight_setupForExercise } from "../models/weight";
import { EquipmentLoadText_line, EquipmentLoadText_picture, IEquipmentLoadPicture } from "../models/equipmentLoadText";
import { Translate_format } from "../i18n/translate";
import { Language_current } from "../i18n/language";
import { n } from "./math";

export function WorkoutSetPlates_picture(
  weight: IWeight,
  settings: ISettings,
  exerciseType: IExerciseType,
  isWarmup: boolean
): IEquipmentLoadPicture | undefined {
  return EquipmentLoadText_picture(
    Weight_realizeLoad(weight, settings, exerciseType, isWarmup),
    Weight_setupForExercise(weight, settings, exerciseType)
  );
}

export function WorkoutSetPlates_line(
  set: ISet,
  settings: ISettings,
  exerciseType: IExerciseType,
  isWarmup: boolean
): IEquipmentLoadPicture | undefined {
  const target = set.completedWeight ?? set.weight;
  if (target == null) {
    return undefined;
  }
  const exercise = Exercise_get(exerciseType, settings.exercises);
  if (Equipment_getEquipmentNameForExerciseType(settings, exercise) == null) {
    return undefined;
  }
  const picture = WorkoutSetPlates_picture(target, settings, exerciseType, isWarmup);
  // personal-fork: Japanese spells the plates out in the line beside the picture, so the picture drops its "10/1.25"
  if (picture?.bars != null && Language_current() === "ja") {
    return { ...picture, bars: picture.bars.map((bar) => ({ ...bar, text: "" })) };
  }
  return picture;
}

// personal-fork: the set's load as words, shown under the live set's inputs
export function WorkoutSetPlates_text(
  set: ISet,
  settings: ISettings,
  exerciseType: IExerciseType,
  isWarmup: boolean
): string | undefined {
  const target = set.completedWeight ?? set.weight;
  if (target == null) {
    return undefined;
  }
  if (Equipment_getEquipmentNameForExerciseType(settings, Exercise_get(exerciseType, settings.exercises)) == null) {
    return undefined;
  }
  const load = Weight_realizeLoad(target, settings, exerciseType, isWarmup);
  const line = EquipmentLoadText_line(load);
  if (load == null || line === "") {
    return undefined;
  }
  const setup = Weight_setupForExercise(target, settings, exerciseType);
  const isOneBar = load.instruction?.type === "plates" && load.instruction.horns.length === 1;
  if (setup?.type !== "plates" || setup.sides !== 2 || !isOneBar) {
    return line;
  }
  const isJa = Language_current() === "ja";
  const plates = isJa
    ? line
        .split("/")
        .map((p) => `${p}${load.unit}`)
        .join("＋")
    : `${line} ${load.unit}`;
  const bar = `${n(setup.base)}${isJa ? "" : " "}${setup.unit}`;
  return setup.base > 0
    ? Translate_format("{plates} per side + bar {bar}", { plates, bar })
    : Translate_format("{plates} per side", { plates });
}
