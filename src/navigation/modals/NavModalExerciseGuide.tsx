import { JSX } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAppState } from "../StateContext";
import { ModalScreenContainer } from "../ModalScreenContainer";
import { FormSheet } from "../FormSheet";
import { GuideHeader } from "../../components/programGuide";
import { ExerciseGuideContent } from "../../components/exerciseGuide";
import type { IRootStackParamList } from "../types";

export function NavModalExerciseGuide(): JSX.Element {
  const { state, dispatch } = useAppState();
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: "exerciseGuideModal";
    params: IRootStackParamList["exerciseGuideModal"];
  }>();
  const insets = useSafeAreaInsets();
  const onClose = (): void => navigation.goBack();

  return (
    <ModalScreenContainer
      zIndex={70}
      onClose={onClose}
      shouldShowClose={false}
      isFullWidth={true}
      isFullHeight={true}
      maxWidth="720px"
    >
      <FormSheet header={<GuideHeader title="How to perform" onClose={onClose} />}>
        <ExerciseGuideContent
          exerciseType={route.params.exerciseType}
          settings={state.storage.settings}
          guides={state.exerciseGuides}
          dispatch={dispatch}
        />
        <div style={{ height: insets.bottom }} />
      </FormSheet>
    </ModalScreenContainer>
  );
}
