import { IExerciseType } from "../types";
import { Exercise_toKey } from "./exercise";
import { exerciseGuideKeys } from "./exerciseGuideKeys.generated";

const keySet = new Set(exerciseGuideKeys);

export function ExerciseGuide_key(type: IExerciseType): string {
  return Exercise_toKey(type).toLowerCase();
}

export function ExerciseGuide_hasGuide(type: IExerciseType): boolean {
  return keySet.has(ExerciseGuide_key(type));
}
