import { JSX, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAppState } from "../StateContext";
import { ModalScreenContainer } from "../ModalScreenContainer";
import { FormSheet } from "../FormSheet";
import { GuideHeader, ProgramGuideContent } from "../../components/programGuide";
import { ProgramGuide_builtinId, ProgramGuide_markdown } from "../../models/programGuide";
import { Program_evaluate } from "../../models/program";
import type { IRootStackParamList } from "../types";

export function NavModalProgramGuide(): JSX.Element {
  const { state } = useAppState();
  const navigation = useNavigation<StackNavigationProp<IRootStackParamList, "programGuideModal">>();
  const route = useRoute<{
    key: string;
    name: "programGuideModal";
    params: IRootStackParamList["programGuideModal"];
  }>();
  const { programId } = route.params;
  const settings = state.storage.settings;
  const insets = useSafeAreaInsets();

  const program =
    state.programs.find((p) => p.id === programId) ?? state.storage.programs.find((p) => p.id === programId);
  const builtinId = program ? ProgramGuide_builtinId(program, state.programsIndex) : undefined;
  const builtin = state.programs.find((p) => p.id === builtinId);
  const guide = builtinId ? state.programGuides[builtinId] : undefined;
  const markdown = useMemo(
    () =>
      guide
        ? ProgramGuide_markdown(
            guide,
            state.programsIndex.map((e) => e.id)
          )
        : undefined,
    [guide, state.programsIndex]
  );
  const evaluatedProgram = useMemo(
    () => (builtin ? Program_evaluate(builtin, settings) : undefined),
    [builtin, settings]
  );
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
      <FormSheet header={<GuideHeader title="Program description" onClose={onClose} />}>
        <ProgramGuideContent
          programId={builtinId ?? programId}
          name={(builtin ?? program)?.name ?? ""}
          author={(builtin ?? program)?.author}
          body={markdown?.body}
          faq={markdown?.faq}
          settings={settings}
          evaluatedProgram={evaluatedProgram}
          onOpenProgram={(id) => navigation.setParams({ programId: id })}
        />
        <div style={{ height: insets.bottom }} />
      </FormSheet>
    </ModalScreenContainer>
  );
}
