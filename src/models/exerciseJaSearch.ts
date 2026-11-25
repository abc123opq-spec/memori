import { jaExerciseNames } from "../i18n/ja/exerciseNames";
import { jaEquipmentNames } from "../i18n/ja/equipmentNames";
import { IEquipment, IExerciseId } from "../types";

const HIRAGANA = /[ぁ-ゖ]/g;
const KATAKANA_OFFSET = 0x60;
const IGNORED = /[\s()（）［］[\]・、,，]/g;
const JAPANESE = /[぀-ヿ㐀-鿿]/;

export interface IExerciseJaSearchItem {
  id?: string;
  name: string;
  equipment?: IEquipment;
}

export function ExerciseJaSearch_normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(HIRAGANA, (c) => String.fromCharCode(c.charCodeAt(0) + KATAKANA_OFFSET))
    .replace(IGNORED, "");
}

export function ExerciseJaSearch_isJapanese(query: string): boolean {
  return JAPANESE.test(query.normalize("NFKC"));
}

function displayName(item: IExerciseJaSearchItem): string {
  return (item.id != null ? jaExerciseNames[item.id as IExerciseId] : undefined) ?? "";
}

export function ExerciseJaSearch_rank(item: IExerciseJaSearchItem, query: string): number | undefined {
  const q = ExerciseJaSearch_normalize(query);
  if (q === "") {
    return 0;
  }
  const name = ExerciseJaSearch_normalize(displayName(item) || item.name);
  const equipment = item.equipment != null ? ExerciseJaSearch_normalize(jaEquipmentNames[item.equipment] ?? "") : "";
  if (name === q) {
    return 0;
  }
  if (name.startsWith(q)) {
    return 1;
  }
  if (name.indexOf(q) !== -1) {
    return 2;
  }
  const haystack = `${name}${equipment}${ExerciseJaSearch_normalize(item.name)}`;
  const tokens = query
    .normalize("NFKC")
    .split(/\s+/)
    .map(ExerciseJaSearch_normalize)
    .filter((t) => t !== "");
  return tokens.every((t) => haystack.indexOf(t) !== -1) ? 3 : undefined;
}

export function ExerciseJaSearch_filterAndRank<T extends IExerciseJaSearchItem>(items: T[], query: string): T[] {
  return items
    .map((item, index) => ({ item, index, rank: ExerciseJaSearch_rank(item, query) }))
    .filter((r): r is { item: T; index: number; rank: number } => r.rank != null)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((r) => r.item);
}
