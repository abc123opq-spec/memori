import { JSX } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ModalScreenContainer } from "../ModalScreenContainer";
import { FormSheet } from "../FormSheet";
import { HelpComponents } from "../../components/help/helpRegistry";
import type { IRootStackParamList } from "../types";

export function NavModalHelp(): JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: "helpModal";
    params: IRootStackParamList["helpModal"];
  }>();
  const { helpKey } = route.params;
  const Component = HelpComponents[helpKey];
  const onClose = (): void => navigation.goBack();
  const insets = useSafeAreaInsets();

  return (
    <ModalScreenContainer onClose={onClose} shouldShowClose={true} isFullWidth={true}>
      <FormSheet>
        {Component ? <Component /> : null}
        {/* personal-fork: contact links go to the author */}
        <View style={{ height: insets.bottom }} />
      </FormSheet>
    </ModalScreenContainer>
  );
}
