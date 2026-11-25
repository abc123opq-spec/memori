import { JSX } from "react";
import { View } from "react-native";
import { Translate_format } from "../i18n/translate";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { useNavOptions } from "../navigation/useNavOptions";
import { Thunk_undoImport } from "../ducks/thunks";
import { IImportSession } from "../types";
import { DateUtils_format } from "../utils/date";
import { StringUtils_pluralize } from "../utils/string";
import { LinkButton } from "./linkButton";

interface IProps {
  dispatch: IDispatch;
  importSessions?: IImportSession[];
}

export function ScreenRecentImports(props: IProps): JSX.Element {
  useNavOptions({ navTitle: "Recent Imports" });
  const importSessions = [...(props.importSessions ?? [])].reverse();

  return (
    <View className="px-gutter">
      {importSessions.length === 0 ? (
        <Text className="py-8 text-center text-text-secondary">No recent imports</Text>
      ) : (
        importSessions.map((session) => (
          <View key={session.id} className="flex-row items-center py-3 border-b border-border-neutral">
            <View className="flex-1">
              <Text noTranslate={true} className="text-base text-text-primary">
                {session.source === "hevy" ? "Hevy" : "CSV"} · {DateUtils_format(session.timestamp)}
              </Text>
              <Text className="text-sm text-text-secondary">
                {session.customExerciseIds.length > 0
                  ? Translate_format(
                      `{count} ${StringUtils_pluralize("workout", session.workoutCount)}, {exercises} new ${StringUtils_pluralize("exercise", session.customExerciseIds.length)}`,
                      { count: session.workoutCount, exercises: session.customExerciseIds.length }
                    )
                  : Translate_format(`{count} ${StringUtils_pluralize("workout", session.workoutCount)}`, {
                      count: session.workoutCount,
                    })}
              </Text>
            </View>
            <LinkButton name={`undo-import-${session.id}`} onClick={() => props.dispatch(Thunk_undoImport(session.id))}>
              Undo
            </LinkButton>
          </View>
        ))
      )}
    </View>
  );
}
