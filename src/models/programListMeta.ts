import { builtinProgramDurations, IBuiltinProgramDuration } from "./builtinPrograms";
import { Translate_format } from "../i18n/translate";
import { ObjectUtils_keys } from "../utils/object";

export function ProgramListMeta_durationLabel(duration: string): string {
  const key = ObjectUtils_keys(builtinProgramDurations).find((k) => k === duration);
  return key != null
    ? builtinProgramDurations[key as IBuiltinProgramDuration]
    : Translate_format("{n} mins", { n: duration });
}
