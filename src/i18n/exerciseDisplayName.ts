import { IAllEquipment, IEquipment, IExerciseType, ISettings } from "../types";
import {
  allExercisesList,
  equipmentName,
  IExercise,
  Exercise_fullName,
  Exercise_nameWithEquipment,
  Exercise_reverseName,
} from "../models/exercise";
import {
  Equipment_currentEquipment,
  Equipment_getEquipmentIdForExerciseType,
  Equipment_getEquipmentNameForExerciseType,
} from "../models/equipment";
import { Language_current } from "./language";
import { jaEquipmentNames, jaExerciseNames } from "./ja";

export function ExerciseDisplayName_name(exercise: Pick<IExercise, "id" | "name">): string {
  if (Language_current() !== "ja") {
    return exercise.name;
  }
  const builtin = allExercisesList[exercise.id];
  const translated = jaExerciseNames[exercise.id];
  return builtin != null && translated != null && builtin.name === exercise.name ? translated : exercise.name;
}

export function ExerciseDisplayName_equipment(equipment: IEquipment | undefined, settings?: IAllEquipment): string {
  const custom = equipment && settings ? settings[equipment]?.name : undefined;
  const translated = equipment && !custom ? jaEquipmentNames[equipment] : undefined;
  if (Language_current() === "ja" && translated != null) {
    return translated;
  }
  return equipmentName(equipment, settings);
}

export function ExerciseDisplayName_equipmentSuffix(equipment: IEquipment, settings?: IAllEquipment): string {
  const name = ExerciseDisplayName_equipment(equipment, settings);
  return Language_current() === "ja" ? `（${name}）` : `, ${name}`;
}

export function ExerciseDisplayName_withEquipment(exercise: IExercise, settings?: ISettings): string {
  if (Language_current() !== "ja") {
    return Exercise_nameWithEquipment(exercise, settings);
  }
  const name = ExerciseDisplayName_name(exercise);
  if (!exercise.equipment) {
    return name;
  }
  const allEquipment = settings ? Equipment_currentEquipment(settings) : {};
  return `${name}${ExerciseDisplayName_equipmentSuffix(exercise.equipment, allEquipment)}`;
}

export function ExerciseDisplayName_reverse(exercise: IExercise, settings?: ISettings): string {
  if (Language_current() !== "ja") {
    return Exercise_reverseName(exercise, settings);
  }
  const name = ExerciseDisplayName_name(exercise);
  if (!exercise.equipment) {
    return name;
  }
  const allEquipment = settings ? Equipment_currentEquipment(settings) : {};
  return `${ExerciseDisplayName_equipment(exercise.equipment, allEquipment)} ${name}`;
}

export function ExerciseDisplayName_full(exercise: IExercise, settings: ISettings, label?: string): string {
  if (Language_current() !== "ja") {
    return Exercise_fullName(exercise, settings, label);
  }
  const hasOwnEquipment = exercise.equipment && exercise.defaultEquipment !== exercise.equipment;
  const base = hasOwnEquipment
    ? ExerciseDisplayName_withEquipment(exercise, settings)
    : ExerciseDisplayName_name(exercise);
  return label ? `${label}：${base}` : base;
}

export function ExerciseDisplayName_exerciseEquipment(
  settings: ISettings,
  exerciseType?: IExerciseType
): string | undefined {
  const name = Equipment_getEquipmentNameForExerciseType(settings, exerciseType);
  if (name == null || Language_current() !== "ja") {
    return name;
  }
  const id = Equipment_getEquipmentIdForExerciseType(settings, exerciseType);
  const translated = id ? jaEquipmentNames[id] : undefined;
  return translated != null && name === equipmentName(id) ? translated : name;
}
