import { JSX } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BottomSheetEditProgramV2Content } from "../../components/bottomSheetEditProgramV2";
import { navigateToModal } from "../navigationService";
import type { IRootStackParamList } from "../types";
import { SheetScreenContainer } from "../SheetScreenContainer";
import { FormSheet } from "../FormSheet";

export function NavModalEditProgramMenu(): JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: "editProgramMenuModal";
    params: IRootStackParamList["editProgramMenuModal"];
  }>();
  const { programId } = route.params;

  const onClose = (): void => {
    navigation.goBack();
  };

  const content = (
    <BottomSheetEditProgramV2Content
      onGenerateProgramImage={() => {
        onClose();
        navigateToModal("programImageExportModal", { programId });
      }}
      onClose={onClose}
    />
  );
  return (
    <SheetScreenContainer onClose={onClose}>
      <FormSheet>{content}</FormSheet>
    </SheetScreenContainer>
  );
}
