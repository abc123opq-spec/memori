import { JSX, useEffect } from "react";
import { Markdown } from "./markdown";
import { IDispatch } from "../ducks/types";
import { Thunk_fetchExerciseGuides } from "../ducks/thunks";
import { Exercise_get, Exercise_targetMusclesGroups } from "../models/exercise";
import { ExerciseGuide_key } from "../models/exerciseGuide";
import { Equipment_currentEquipment } from "../models/equipment";
import { Muscle_getMuscleGroupName } from "../models/muscle";
import { ExerciseDisplayName_equipmentSuffix, ExerciseDisplayName_name } from "../i18n/exerciseDisplayName";
import { Translate_text } from "../i18n/translate";
import { IExerciseType, ISettings } from "../types";

interface IProps {
  exerciseType: IExerciseType;
  settings: ISettings;
  guides?: Record<string, string>;
  dispatch: IDispatch;
}

export function ExerciseGuideContent(props: IProps): JSX.Element {
  useEffect(() => {
    props.dispatch(Thunk_fetchExerciseGuides());
  }, []);

  const exercise = Exercise_get(props.exerciseType, props.settings.exercises);
  const equipment = props.exerciseType.equipment;
  const muscles = Exercise_targetMusclesGroups(props.exerciseType, props.settings);
  const content = props.guides?.[ExerciseGuide_key(props.exerciseType)];

  return (
    <div className="guide-article" data-testid="exercise-guide">
      <h1 className="guide-title">
        {ExerciseDisplayName_name(exercise)}
        {equipment && (
          <span className="whitespace-nowrap">
            {ExerciseDisplayName_equipmentSuffix(equipment, Equipment_currentEquipment(props.settings))}
          </span>
        )}
      </h1>
      {muscles.length > 0 && (
        <div className="guide-chips">
          {muscles.map((m) => (
            <span key={m}>{Translate_text(Muscle_getMuscleGroupName(m, props.settings))}</span>
          ))}
        </div>
      )}
      {props.guides != null &&
        (content ? (
          <Markdown isHtmlAllowed={true} value={content} className="guide-markdown guide-markdown-exercise" />
        ) : (
          <p className="guide-empty" data-testid="exercise-guide-empty">
            {Translate_text("No guide for this exercise yet")}
          </p>
        ))}
    </div>
  );
}
