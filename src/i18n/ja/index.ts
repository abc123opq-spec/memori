import { jaCommon } from "./common";
import { jaWorkout } from "./workout";
import { jaProgram } from "./program";
import { jaStats } from "./stats";
import { jaScreens } from "./screens";
import { jaModalsA } from "./modalsA";
import { jaModalsB } from "./modalsB";
import { jaPickers } from "./pickers";
import { jaMessages } from "./messages";
import { jaMuscles } from "./muscles";
import { jaGuide } from "./guide";
import { jaRedesignWorkout } from "./redesignWorkout";
import { jaRedesignHome } from "./redesignHome";
import { jaRedesignPrograms } from "./redesignPrograms";
import { jaPersonalArt } from "./personalArt";

export { jaExerciseNames } from "./exerciseNames";
export { jaEquipmentNames } from "./equipmentNames";

export const jaDictionaries: Record<string, Record<string, string>> = {
  common: jaCommon,
  workout: jaWorkout,
  program: jaProgram,
  stats: jaStats,
  screens: jaScreens,
  modalsA: jaModalsA,
  modalsB: jaModalsB,
  pickers: jaPickers,
  messages: jaMessages,
  muscles: jaMuscles,
  guide: jaGuide,
  redesignWorkout: jaRedesignWorkout,
  redesignHome: jaRedesignHome,
  redesignPrograms: jaRedesignPrograms,
  personalArt: jaPersonalArt,
};

export const ja: Record<string, string> = {
  ...jaCommon,
  ...jaWorkout,
  ...jaProgram,
  ...jaStats,
  ...jaScreens,
  ...jaModalsA,
  ...jaModalsB,
  ...jaPickers,
  ...jaMessages,
  ...jaMuscles,
  ...jaGuide,
  ...jaRedesignWorkout,
  ...jaRedesignHome,
  ...jaRedesignPrograms,
  ...jaPersonalArt,
};
