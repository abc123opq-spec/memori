import { JSX, ReactNode, useMemo, useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { Text } from "./primitives/text";
import { IDispatch } from "../ducks/types";
import { IProgram, ISettings, ISubscription, IStats } from "../types";
import { IconMuscles2 } from "./icons/iconMuscles2";
import { IPoints, Muscle_normalizePoints, Muscle_getPointsForProgram, Muscle_getPointsForDay } from "../models/muscle";
import { Modal } from "./modal";
import { MusclesView } from "./muscles/musclesView";
import { Locker } from "./locker";
import { navigateToModal } from "../navigation/navigationService";
import { Subscriptions_hasSubscription } from "../utils/subscriptions";
import {
  IEvaluatedProgram,
  Program_evaluate,
  Program_dayAverageTimeMs,
  Program_daysAndExercises,
  Program_getProgramDay,
} from "../models/program";
import { TimeUtils_formatHHMM } from "../utils/time";
import { IconWatch } from "./icons/iconWatch";
import { ProgramPreviewOrPlayground } from "./programPreviewOrPlayground";
import { IconDoc } from "./icons/iconDoc";
import { SimpleMarkdown } from "./simpleMarkdown";
import { Link } from "./link";
import { Translate_format } from "../i18n/translate";
import { ProgramGuideLinks_externalUrl } from "../models/programGuideLinks";
import { ProgramGuideEntry } from "./programGuideEntry";

export type IPreviewProgramMuscles =
  | {
      dayIndex: number;
      type: "day";
    }
  | { type: "program" };

interface IProps {
  dispatch?: IDispatch;
  settings: ISettings;
  program: IProgram;
  isMobile: boolean;
  subscription: ISubscription;
  stats: IStats;
  hasNavbar?: boolean;
  useNavModals?: boolean;
  headerContent?: ReactNode;
  hideMuscles?: boolean;
  isReadOnly?: boolean;
}

export function ProgramPreview(props: IProps): JSX.Element {
  const program = props.program;
  const settings = props.settings;
  const evaluatedProgram = useMemo(() => Program_evaluate(program, settings), [program, settings]);
  const [musclesModal, setMusclesModal] = useState<IPreviewProgramMuscles | undefined>(undefined);
  const isWeb = Platform.OS === "web";
  const headerContent = props.headerContent;
  const hideMuscles = props.hideMuscles;
  const externalUrl = ProgramGuideLinks_externalUrl(program.url);

  const previewHeader = useMemo(
    () => (
      <View>
        {headerContent}
        <View className="px-4">
          <View className="flex-row items-center pt-2">
            <View className="flex-1">
              {/* personal-fork: plain title, the author-site link is dropped and other sites move next to the byline */}
              <Text
                noTranslate={true}
                data-testid="program-name"
                testID="program-name"
                className="text-2xl font-bold leading-tight"
              >
                {program.name}
              </Text>
            </View>
            {!hideMuscles && (
              <Pressable
                data-testid="program-show-muscles"
                testID="program-show-muscles"
                className="p-2"
                onPress={() => {
                  if (isWeb) {
                    setMusclesModal({ type: "program" });
                  } else {
                    navigateToModal("programPreviewMusclesModal", { type: "program" });
                  }
                }}
              >
                <IconMuscles2 />
              </Pressable>
            )}
          </View>
          <View>
            <View className="flex-row flex-wrap items-center">
              {program.author && (
                <Text
                  noTranslate={true}
                  data-testid="program-author"
                  testID="program-author"
                  className="mr-3 text-sm font-bold uppercase text-text-secondary"
                >
                  {Translate_format("By {author}", { author: program.author })}
                </Text>
              )}
              {externalUrl && (
                <Link className="text-sm" href={externalUrl}>
                  Official site
                </Link>
              )}
            </View>
            <View className="flex-row items-start py-1">
              <View className="mt-0.5">
                <IconWatch />
              </View>
              <Text className="flex-1 ml-1">
                Average time to finish a workout:{" "}
                <Text className="font-bold">
                  {TimeUtils_formatHHMM(Program_dayAverageTimeMs(evaluatedProgram, settings))}
                </Text>
              </Text>
            </View>
            <View className="flex-row items-start py-1">
              <View className="mt-0.5">
                <IconDoc width={15} height={20} />
              </View>
              <Text className="flex-1 ml-1 text-text-secondary">{Program_daysAndExercises(evaluatedProgram)}</Text>
            </View>
            {program.description && (
              <View className="pt-2">
                <SimpleMarkdown value={program.description} />
              </View>
            )}
            <View className="pt-3">
              <ProgramGuideEntry
                program={program}
                testID="program-preview-guide-open"
                label="Full description and FAQ"
                isCard={true}
              />
            </View>
          </View>
        </View>
      </View>
    ),
    [headerContent, program, evaluatedProgram, settings, isWeb, hideMuscles, externalUrl]
  );

  if (!isWeb) {
    return (
      <ProgramPreviewOrPlayground
        headerContent={previewHeader}
        program={program}
        settings={props.settings}
        isMobile={props.isMobile}
        hasNavbar={props.hasNavbar}
        stats={props.stats}
        useNavModals={props.useNavModals}
        isReadOnly={props.isReadOnly}
      />
    );
  }

  return (
    <View className="flex-1 pb-6">
      <ProgramPreviewOrPlayground
        headerContent={previewHeader}
        program={program}
        settings={props.settings}
        isMobile={props.isMobile}
        hasNavbar={props.hasNavbar}
        stats={props.stats}
        useNavModals={props.useNavModals}
        isReadOnly={props.isReadOnly}
      />
      {musclesModal && (
        <ProgramPreviewMusclesModal
          muscles={musclesModal}
          onClose={() => setMusclesModal(undefined)}
          stats={props.stats}
          program={evaluatedProgram}
          subscription={props.subscription}
          dispatch={props.dispatch}
          settings={props.settings}
        />
      )}
    </View>
  );
}

interface IProgramPreviewMusclesModalProps {
  muscles: IPreviewProgramMuscles;
  program: IEvaluatedProgram;
  stats: IStats;
  settings: ISettings;
  dispatch?: IDispatch;
  subscription: ISubscription;
  onClose: () => void;
}

export function ProgramPreviewMusclesModal(props: IProgramPreviewMusclesModalProps): JSX.Element {
  let points: IPoints | undefined;
  let name = "";
  if (props.muscles.type === "program") {
    points = Muscle_normalizePoints(Muscle_getPointsForProgram(props.program, props.stats, props.settings));
    name = props.program.name;
  } else {
    const programDay = Program_getProgramDay(props.program, props.muscles.dayIndex + 1);
    if (programDay) {
      points = Muscle_normalizePoints(Muscle_getPointsForDay(props.program, programDay, props.stats, props.settings));
      name = programDay.name;
    }
  }
  if (!points || !name) {
    return <></>;
  }
  const title =
    props.muscles.type === "program"
      ? Translate_format("Muscles for program '{name}'", { name: props.program.name })
      : Translate_format("Muscles for day '{name}'", { name });

  return (
    <Modal
      shouldShowClose={true}
      onClose={props.onClose}
      isFullWidth={true}
      overflowHidden={props.dispatch && !Subscriptions_hasSubscription(props.subscription)}
    >
      {props.dispatch && (
        <Locker topic="Muscles" dispatch={props.dispatch} blur={8} subscription={props.subscription} />
      )}
      <Text noTranslate={true} className="pb-2 text-xl font-bold text-center">
        {title}
      </Text>
      <MusclesView settings={props.settings} points={points} title={props.program.name} />
    </Modal>
  );
}
