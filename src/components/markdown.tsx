import { JSX, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { LinkButton } from "./linkButton";
import { IEvaluatedProgram } from "../models/program";
import { ISettings } from "../types";
import { Exercise_findByNameAndEquipment } from "../models/exercise";
import { ExerciseTooltip } from "./exerciseTooltip";
import { MarkdownHtml_directives, MarkdownHtml_render } from "../utils/markdownHtml";
import { PersonalUnits_exampleOnerm, PersonalUnits_exampleWeekLabel } from "../models/personalUnits";

export interface IMarkdownDirectivesData {
  exercise?: { settings: ISettings };
  exerciseExample?: { settings: ISettings; evaluatedProgram: IEvaluatedProgram };
}

interface IProps {
  value: string;
  className?: string;
  truncate?: number;
  directivesData?: IMarkdownDirectivesData;
  isHtmlDisabled?: boolean;
  isHtmlAllowed?: boolean;
}

export function Markdown(props: IProps): JSX.Element {
  const [shouldTruncate, setShouldTruncate] = useState(props.truncate != null);
  const [isTruncated, setIsTruncated] = useState(props.truncate != null);
  const stringValue = typeof props.value === "string" ? props.value : String(props.value ?? "");
  const preprocessed = MarkdownHtml_directives(stringValue, {
    exercise: !!props.directivesData?.exercise,
    exerciseExample: !!props.directivesData?.exerciseExample,
  });
  const value = typeof preprocessed === "string" ? preprocessed : String(preprocessed ?? "");
  // personal-fork: raw HTML only for the bundled guides; program, note and imported text is escaped
  const result = MarkdownHtml_render(value, !props.isHtmlAllowed || !!props.isHtmlDisabled);
  let className = props.className || "markdown";
  if (isTruncated && props.className?.indexOf("line-clamp") === -1) {
    className += ` line-clamp-${props.truncate}`;
  }

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (isTruncated) {
      setShouldTruncate(container!.scrollHeight > container!.clientHeight);
    }
    if (container) {
      for (const element of Array.from(container.querySelectorAll("a"))) {
        if (!(element.getAttribute("href") || "").startsWith("/")) {
          element.setAttribute("target", "_blank");
        }
      }
      hydrateLiftoscriptCodeBlocks(container);
      hydrateLiftographCodeBlocks(container);
      setTimeout(() => {
        if (props.directivesData?.exercise) {
          hydrateExerciseDirectives(container, props.directivesData.exercise.settings);
        }
        if (props.directivesData?.exerciseExample) {
          hydrateExerciseExampleDirectives(
            container,
            props.directivesData.exerciseExample.settings,
            props.directivesData.exerciseExample.evaluatedProgram
          );
        }
      }, 0);
    }
  });

  return (
    <div>
      <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: result }} />
      {shouldTruncate && props.truncate != null && (
        <div className="leading-none" style={{ marginTop: "-0.125rem" }}>
          <LinkButton
            name="truncate-markdown"
            className="text-xs font-normal"
            onClick={() => setIsTruncated(!isTruncated)}
          >
            {isTruncated ? "Show more" : "Show less"}
          </LinkButton>
        </div>
      )}
    </div>
  );
}

function hydrateLiftoscriptCodeBlocks(container: HTMLElement): void {
  const codeEls = Array.from(container.querySelectorAll("code.language-liftoscript"));
  if (codeEls.length === 0) {
    return;
  }
  import("../pages/planner/components/plannerCodeBlock").then((mod) => {
    for (const codeEl of codeEls) {
      if (codeEl.getAttribute("data-hydrated")) {
        continue;
      }
      codeEl.setAttribute("data-hydrated", "true");
      const script = codeEl.textContent || "";
      const pre = codeEl.parentElement;
      if (pre && pre.tagName === "PRE") {
        const wrapper = document.createElement("div");
        wrapper.className = "md-liftoscript-block";
        pre.parentNode!.replaceChild(wrapper, pre);
        createRoot(wrapper).render(<mod.PlannerCodeBlock script={script} />);
      }
    }
  });
}

function hydrateLiftographCodeBlocks(container: HTMLElement): void {
  const codeEls = Array.from(container.querySelectorAll("code.language-liftograph"));
  if (codeEls.length === 0) {
    return;
  }
  import("./liftographCodeBlock").then((mod) => {
    for (const codeEl of codeEls) {
      if (codeEl.getAttribute("data-hydrated")) {
        continue;
      }
      codeEl.setAttribute("data-hydrated", "true");
      const text = (codeEl.textContent || "").replace(/\n+$/, "");
      const pre = codeEl.parentElement;
      if (pre && pre.tagName === "PRE") {
        const wrapper = document.createElement("div");
        wrapper.className = "md-liftoscript-block";
        pre.parentNode!.replaceChild(wrapper, pre);
        createRoot(wrapper).render(<mod.LiftographCodeBlock text={text} />);
      }
    }
  });
}

function hydrateExerciseDirectives(container: HTMLElement, settings: ISettings): void {
  for (const el of Array.from(container.querySelectorAll(".md-exercise-directive"))) {
    if (el.getAttribute("data-hydrated")) {
      continue;
    }
    el.setAttribute("data-hydrated", "true");
    const name = el.getAttribute("data-name") || "";
    const exercise = Exercise_findByNameAndEquipment(name, settings.exercises);
    if (!exercise) {
      continue;
    }
    const exerciseType = { id: exercise.id, equipment: exercise.equipment };
    el.textContent = "";
    createRoot(el).render(<ExerciseTooltip exerciseType={exerciseType} settings={settings} name={name} />);
  }
}

function hydrateExerciseExampleDirectives(
  container: HTMLElement,
  settings: ISettings,
  evaluatedProgram: IEvaluatedProgram
): void {
  for (const el of Array.from(container.querySelectorAll(".md-exercise-example"))) {
    if (el.getAttribute("data-hydrated")) {
      continue;
    }
    el.setAttribute("data-hydrated", "true");
    const exercise = el.getAttribute("data-exercise") || "";
    const equipment = el.getAttribute("data-equipment") || "";
    const key = el.getAttribute("data-key") || "";
    const weeksStr = el.getAttribute("data-weeks") || "";
    const weekLabelsStr = el.getAttribute("data-week-labels") || "";
    const onermStr = el.getAttribute("data-onerm") || "";

    const exerciseType = { id: exercise, equipment };
    const weekLabels = weekLabelsStr ? weekLabelsStr.split(",") : [];

    let weekSetup: { name: string }[] | undefined;
    if (weeksStr) {
      const [start, end] = weeksStr.split("-").map(Number);
      weekSetup = evaluatedProgram.weeks.slice(start - 1, end).map((w, i) => ({
        name: PersonalUnits_exampleWeekLabel(w.name, weekLabels[i], settings.units),
        weekIndex: start - 1 + i,
      }));
    } else if (weekLabels.length > 0) {
      weekSetup = evaluatedProgram.weeks.map((w, i) => ({
        name: PersonalUnits_exampleWeekLabel(w.name, weekLabels[i], settings.units),
      }));
    }

    // personal-fork: example onerm and week labels are written in lb and English
    import("../pages/programs/programDetails/programDetailsExerciseExample").then((mod) => {
      createRoot(el as HTMLElement).render(
        <mod.ProgramDetailsExerciseExample
          program={evaluatedProgram}
          settings={settings}
          programExerciseKey={key}
          exerciseType={exerciseType}
          weekSetup={weekSetup}
          defaultOnerm={PersonalUnits_exampleOnerm(onermStr, settings.units)}
        />
      );
    });
  }
}
