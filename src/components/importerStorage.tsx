import { JSX, useCallback } from "react";
import { Translate_text } from "../i18n/translate";
import { View } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { MenuItemWrapper } from "./menuItem";
import { Thunk_importStorage } from "../ducks/thunks";
import { FileImport_pickFile, FileImport_confirm } from "../utils/fileImport";

interface IImporterStorageProps {
  dispatch: IDispatch;
}

export function ImporterStorage(props: IImporterStorageProps): JSX.Element {
  const onPress = useCallback(async () => {
    const contents = await FileImport_pickFile("json");
    if (contents == null) {
      return;
    }
    const ok = await FileImport_confirm(
      Translate_text(
        "Importing new data will wipe out your current data. If you don't want to lose it, make sure to 'Export data to file' first. Press 'OK' to proceed with import."
      )
    );
    if (ok) {
      props.dispatch(Thunk_importStorage(contents));
    }
  }, [props.dispatch]);

  return (
    <MenuItemWrapper name="Import data from JSON file" onClick={onPress}>
      <View className="justify-center py-3" style={{ minHeight: 52 }}>
        <Text className="text-base text-text-primary">Import data from JSON file</Text>
      </View>
    </MenuItemWrapper>
  );
}
