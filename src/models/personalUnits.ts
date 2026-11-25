import { ILanguage } from "../i18n/language";
import { Translate_format } from "../i18n/translate";
import { IAllEquipment, ILengthUnit, IPlannerProgram, ISettings, IUnit } from "../types";
import { PlannerProgram_switchToUnit } from "../pages/planner/models/plannerProgram";
import { EquipmentSetup_save } from "./equipmentSetup";
import { Weight_build, Weight_smartConvert } from "./weight";

const KG_PER_LB = 0.45359237;
const RECORD_LB = 500;
const lbNumber = /(約)?(\d[\d,]*(?:\.\d+)?)(?:\s*([〜~–-])\s*(\d[\d,]*(?:\.\d+)?))?\s*(?:lbs?|ポンド)(?![A-Za-z])/g;
// personal-fork: no lookbehind; iOS Safari before 16.4 cannot parse it and the whole bundle fails
const anyLb = /(^|[^A-Za-z])lbs?(?![A-Za-z])|ポンド/;

export function PersonalUnits_defaults(language: ILanguage): { units: IUnit; lengthUnits: ILengthUnit } {
  return language === "ja" ? { units: "kg", lengthUnits: "cm" } : { units: "lb", lengthUnits: "in" };
}

export function PersonalUnits_skipUnitScreen(language: ILanguage): boolean {
  return language === "ja";
}

function gymKg(lb: number): string {
  return String(Weight_smartConvert(Weight_build(lb, "lb"), "kg").value);
}

function recordKg(lb: number): string {
  return Math.round(lb * KG_PER_LB).toLocaleString("en-US");
}

function convertLine(line: string): { text: string; flagged: boolean } {
  if (!anyLb.test(line)) {
    return { text: line, flagged: false };
  }
  if (/\d\s*kg/.test(line) || /(lbs?|ポンド)あたり/.test(line)) {
    return { text: line, flagged: true };
  }
  let flagged = false;
  const isBodyweight = line.includes("体重");
  const text = line.replace(lbNumber, (_m, approx: string | undefined, a: string, dash: string, b: string) => {
    const from = parseFloat(a.replace(/,/g, ""));
    if (b != null) {
      flagged = true;
      return `${approx ?? ""}${gymKg(from)}${dash}${gymKg(parseFloat(b.replace(/,/g, "")))}kg`;
    }
    if (from >= RECORD_LB || a.includes(",") || isBodyweight) {
      flagged = true;
      return `約${recordKg(from)}kg`;
    }
    return `${approx ?? ""}${gymKg(from)}kg`;
  });
  return { text, flagged: flagged || anyLb.test(text) };
}

export function PersonalUnits_lbTextToKg(markdown: string): { text: string; flagged: string[] } {
  const flagged: string[] = [];
  const lines = markdown.split("\n");
  let inFrontmatter = lines[0]?.trim() === "---";
  let inCode = false;
  const out = lines.map((line, i) => {
    if (inFrontmatter) {
      if (i > 0 && line.trim() === "---") {
        inFrontmatter = false;
        return line;
      }
      if (!line.startsWith("shortDescription:")) {
        return line;
      }
    } else if (/^```/.test(line)) {
      inCode = !inCode;
      return line;
    } else if (inCode || line.startsWith(":::")) {
      return line;
    }
    const result = convertLine(line);
    if (result.flagged) {
      flagged.push(line);
    }
    return result.text;
  });
  return { text: out.join("\n"), flagged };
}

export function PersonalUnits_exampleOnerm(onerm: string, units: IUnit): number | undefined {
  const value = parseFloat(onerm);
  if (isNaN(value)) {
    return undefined;
  }
  return Weight_smartConvert(Weight_build(value, "lb"), units).value;
}

export function PersonalUnits_exampleWeekLabel(weekName: string, label: string | undefined, units: IUnit): string {
  const week = /^Week (\d+)$/.exec(weekName);
  const name = week ? Translate_format("Week {value}", { value: week[1] }) : weekName;
  if (!label) {
    return name;
  }
  const shown = units === "kg" ? convertLine(label).text : label;
  return Translate_format("{label} ({arg})", { label: name, arg: shown });
}

const SMALLEST_KG_PLATE = 1.25;

export function PersonalUnits_withoutMicroPlates(settings: ISettings): ISettings {
  const gyms = settings.gyms.map((gym) => {
    const equipment: IAllEquipment = {};
    for (const [key, data] of Object.entries(gym.equipment)) {
      const setup = data?.setup;
      equipment[key] =
        data != null && setup?.type === "plates" && setup.unit === "kg"
          ? EquipmentSetup_save(data, { ...setup, plates: setup.plates.filter((p) => p.weight >= SMALLEST_KG_PLATE) })
          : data;
    }
    return { ...gym, equipment };
  });
  return { ...settings, gyms };
}

const SMALLEST_KG_STEP = 2.5;
const progressArgs = /(progress:\s*\w+\()([^)]*)(\))/g;
const kgValue = /(-?\d+(?:\.\d+)?)kg/g;

export function PersonalUnits_roundSmallIncrements(exerciseText: string, units: IUnit): string {
  if (units !== "kg") {
    return exerciseText;
  }
  return exerciseText.replace(progressArgs, (_all, head: string, args: string, tail: string) => {
    const rounded = args.replace(kgValue, (literal: string, raw: string) => {
      const value = Number(raw);
      if (value === 0 || Math.abs(value) >= SMALLEST_KG_STEP) {
        return literal;
      }
      return `${value < 0 ? -SMALLEST_KG_STEP : SMALLEST_KG_STEP}kg`;
    });
    return `${head}${rounded}${tail}`;
  });
}

export function PersonalUnits_programToUnit(planner: IPlannerProgram, settings: ISettings): IPlannerProgram {
  if (settings.units === "lb") {
    return planner;
  }
  const switched = PlannerProgram_switchToUnit(planner, settings);
  return {
    ...switched,
    weeks: switched.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        exerciseText: PersonalUnits_roundSmallIncrements(day.exerciseText, settings.units),
      })),
    })),
  };
}
