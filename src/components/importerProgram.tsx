import { JSX, useCallback } from "react";
import { Translate_text } from "../i18n/translate";
import { View } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { MenuItemWrapper } from "./menuItem";
import { Thunk_importProgram } from "../ducks/thunks";
import { FileImport_pickFile, FileImport_confirm } from "../utils/fileImport";

interface IImporterProgramProps {
  dispatch: IDispatch;
}

export function ImporterProgram(props: IImporterProgramProps): JSX.Element {
  const onPress = useCallback(async () => {
    const contents = await FileImport_pickFile("json");
    if (contents == null) {
      return;
    }
    const ok = await FileImport_confirm(
      Translate_text(
        "Importing new program will overwrite an existing one if a program with the same id exists, or create a new one otherwise."
      )
    );
    if (ok) {
      props.dispatch(Thunk_importProgram({ decoded: contents }));
    }
  }, [props.dispatch]);

  return (
    <MenuItemWrapper name="Import program from JSON file" onClick={onPress}>
      <View className="justify-center py-3" style={{ minHeight: 52 }}>
        <Text className="text-base text-text-primary">Import program from JSON file</Text>
      </View>
    </MenuItemWrapper>
  );
}
