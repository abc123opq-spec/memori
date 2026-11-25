import { IProgram } from "../types";
import { IProgramIndexEntry } from "./program";
import { ProgramGuideLinks_rewrite } from "./programGuideLinks";

export interface IProgramGuide {
  fullDescription: string;
  faq?: string;
}

const moreSeparator = "<!-- more -->";

function onlyMatch(index: IProgramIndexEntry[], test: (e: IProgramIndexEntry) => boolean): string | undefined {
  const found = index.filter(test);
  return found.length === 1 ? found[0].id : undefined;
}

export function ProgramGuide_builtinId(program: IProgram, index: IProgramIndexEntry[]): string | undefined {
  if (index.some((e) => e.id === program.id)) {
    return program.id;
  }
  const byDescription = program.shortDescription
    ? onlyMatch(index, (e) => e.shortDescription === program.shortDescription)
    : undefined;
  if (byDescription != null) {
    return byDescription;
  }
  return program.url ? onlyMatch(index, (e) => e.url === program.url) : undefined;
}

export function ProgramGuide_markdown(guide: IProgramGuide, knownIds: string[]): { body: string; faq?: string } {
  const at = guide.fullDescription.indexOf(moreSeparator);
  const body = at === -1 ? guide.fullDescription : guide.fullDescription.slice(at + moreSeparator.length);
  return {
    body: ProgramGuideLinks_rewrite(body.trim(), knownIds),
    faq: guide.faq ? ProgramGuideLinks_rewrite(guide.faq.trim(), knownIds) : undefined,
  };
}
