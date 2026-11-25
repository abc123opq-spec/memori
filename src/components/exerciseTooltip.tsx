import { JSX, useEffect, useRef, useState } from "react";
import { StringUtils_joinNames } from "../utils/string";
import { IExerciseType, ISettings } from "../types";
import { Exercise_get, Exercise_targetMusclesGroups, Exercise_synergistMusclesGroups } from "../models/exercise";
import { Muscle_getMuscleGroupName } from "../models/muscle";
import { Equipment_currentEquipment } from "../models/equipment";
import { ExerciseDisplayName_equipmentSuffix, ExerciseDisplayName_name } from "../i18n/exerciseDisplayName";
import { Translate_text } from "../i18n/translate";

export function ExerciseTooltip(props: {
  exerciseType: IExerciseType;
  settings: ISettings;
  name: string;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [nudge, setNudge] = useState(0);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: Event): void {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPinned(false);
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("touchstart", handleOutsideClick, true);
    };
  }, []);

  useEffect(() => {
    if (!show || !tooltipRef.current) {
      setNudge(0);
      return;
    }
    const rect = tooltipRef.current.getBoundingClientRect();
    const article = tooltipRef.current.parentElement?.closest(".guide-article")?.getBoundingClientRect();
    const minLeft = (article?.left ?? 0) + 8;
    const maxRight = (article?.right ?? document.documentElement.clientWidth) - 8;
    if (rect.left < minLeft) {
      setNudge(minLeft - rect.left);
    } else if (rect.right > maxRight) {
      setNudge(maxRight - rect.right);
    } else {
      setNudge(0);
    }
  }, [show]);

  // personal-fork: show the translated name; the guide markdown keeps English names for lookup
  const exercise = Exercise_get(props.exerciseType, props.settings.exercises);
  const displayName = ExerciseDisplayName_name(exercise);
  const equipmentSuffix =
    props.name.includes(",") && props.exerciseType.equipment
      ? ExerciseDisplayName_equipmentSuffix(props.exerciseType.equipment, Equipment_currentEquipment(props.settings))
      : undefined;
  const targetMuscles = Exercise_targetMusclesGroups(props.exerciseType, props.settings);
  const synergistMuscles = Exercise_synergistMusclesGroups(props.exerciseType, props.settings);

  return (
    <span
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        if (!pinned) {
          setShow(true);
        }
      }}
      onMouseLeave={() => {
        if (!pinned) {
          setShow(false);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (pinned) {
          setPinned(false);
          setShow(false);
        } else {
          setPinned(true);
          setShow(true);
        }
      }}
    >
      <strong className="cursor-pointer md-exercise-name" style={{ borderBottom: "1px dashed var(--color-text-ink3)" }}>
        {displayName}
        {equipmentSuffix && <span className="whitespace-nowrap">{equipmentSuffix}</span>}
      </strong>
      {show && (
        <div
          ref={tooltipRef}
          className="absolute z-20 px-3 py-2 text-xs border rounded-lg md-exercise-tooltip bg-background-default border-border-line text-text-primary"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: `translateX(calc(-50% + ${nudge}px))`,
            minWidth: "14rem",
            maxWidth: "min(22rem, calc(100vw - 48px))",
          }}
        >
          {/* personal-fork: no exercise photos in this build, so the image column is gone */}
          <div className="mb-1 leading-relaxed">
            <div className="text-sm font-semibold">
              {displayName}
              {equipmentSuffix}
            </div>
            {targetMuscles.length > 0 && (
              <div>
                <span className="font-semibold text-text-secondary">{Translate_text("Target:")}</span>
                <span className="ml-1 font-normal">
                  {StringUtils_joinNames(
                    targetMuscles.map((m) => Translate_text(Muscle_getMuscleGroupName(m, props.settings)))
                  )}
                </span>
              </div>
            )}
            {synergistMuscles.length > 0 && (
              <div>
                <span className="font-semibold text-text-secondary">{Translate_text("Synergist:")}</span>
                <span className="ml-1 font-normal">
                  {StringUtils_joinNames(
                    synergistMuscles.map((m) => Translate_text(Muscle_getMuscleGroupName(m, props.settings)))
                  )}
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              left: `calc(50% - ${nudge}px)`,
              transform: "translateX(-50%) rotate(45deg)",
              width: "10px",
              height: "10px",
              background: "var(--color-background-default)",
              borderRight: "1px solid var(--color-border-line)",
              borderBottom: "1px solid var(--color-border-line)",
            }}
          />
        </div>
      )}
    </span>
  );
}
