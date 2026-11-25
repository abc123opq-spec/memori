import { JSX, MouseEvent, useEffect, useRef } from "react";
import { Markdown, IMarkdownDirectivesData } from "./markdown";
import { IEvaluatedProgram } from "../models/program";
import { ProgramGuideLinks_programId } from "../models/programGuideLinks";
import { Translate_format, Translate_text } from "../i18n/translate";
import { ISettings } from "../types";
import { PlannerCodeBlock } from "../pages/planner/components/plannerCodeBlock";
import { ProgramDetailsExerciseExample } from "../pages/programs/programDetails/programDetailsExerciseExample";

// personal-fork: static imports put these in app.js, so the async chunks of Markdown are not needed offline
export const ProgramGuide_bundledParts = [PlannerCodeBlock, ProgramDetailsExerciseExample];

export function GuideHeader(props: { title: string; onClose: () => void }): JSX.Element {
  return (
    <div className="guide-header">
      <span className="guide-header-title">{Translate_text(props.title)}</span>
      <button
        type="button"
        className="guide-close"
        data-testid="guide-close"
        aria-label={Translate_text("Close")}
        onClick={props.onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

interface IProps {
  programId: string;
  name: string;
  author?: string;
  body?: string;
  faq?: string;
  settings: ISettings;
  evaluatedProgram?: IEvaluatedProgram;
  onOpenProgram: (programId: string) => void;
}

export function ProgramGuideContent(props: IProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [props.programId]);

  const directives: IMarkdownDirectivesData = {
    exercise: { settings: props.settings },
    exerciseExample: props.evaluatedProgram
      ? { settings: props.settings, evaluatedProgram: props.evaluatedProgram }
      : undefined,
  };
  const onClick = (e: MouseEvent<HTMLDivElement>): void => {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href");
    const id = href ? ProgramGuideLinks_programId(href) : undefined;
    if (id) {
      e.preventDefault();
      props.onOpenProgram(id);
    }
  };

  return (
    <div ref={rootRef} key={props.programId} className="guide-article" data-testid="program-guide" onClick={onClick}>
      <h1 className="guide-title" data-testid="program-guide-title">
        {props.name}
      </h1>
      {props.author && <p className="guide-byline">{Translate_format("by {author}", { author: props.author })}</p>}
      {props.body ? (
        <Markdown isHtmlAllowed={true} value={props.body} className="guide-markdown" directivesData={directives} />
      ) : (
        <p className="guide-empty">{Translate_text("No description for this program yet")}</p>
      )}
      {props.faq && (
        <section data-testid="program-guide-faq">
          <h2 className="guide-section-title">{Translate_text("Frequently asked questions")}</h2>
          <Markdown isHtmlAllowed={true} value={props.faq} className="guide-markdown" directivesData={directives} />
        </section>
      )}
    </div>
  );
}
