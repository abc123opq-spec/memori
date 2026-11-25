import { JSX } from "react";
import { Pressable, View } from "react-native";
import { ProgramGuideLinks_externalUrl, ProgramGuideLinks_rewrite } from "../models/programGuideLinks";
import { Text } from "./primitives/text";
import { Button } from "./button";
import { IProgram, ISettings } from "../types";
import { Link } from "./link";
import { IconWatch } from "./icons/iconWatch";
import { PersonalFormat_duration, PersonalFormat_label } from "../personal/format";
import { Program_evaluate, Program_dayAverageTimeMs } from "../models/program";
import { SimpleMarkdown } from "./simpleMarkdown";
import { Translate_format } from "../i18n/translate";

interface IProps {
  program: IProgram;
  hasCustomPrograms: boolean;
  settings: ISettings;
  onSelect: () => void;
  onPreview: () => void;
  onClose: () => void;
  onGuide?: () => void;
}

export function ModalProgramInfoContent(props: IProps): JSX.Element {
  const externalUrl = ProgramGuideLinks_externalUrl(props.program.url);
  const evaluatedProgram = Program_evaluate(props.program, props.settings);
  const time = Program_dayAverageTimeMs(evaluatedProgram, props.settings);
  const formattedTime = time > 0 ? PersonalFormat_duration(time) : undefined;
  return (
    <>
      {/* personal-fork: plain title in Japanese word order; the author-site link moves next to the byline */}
      <View>
        <Text noTranslate={true} className="pr-6 text-lg font-bold">
          {Translate_format(props.hasCustomPrograms ? "Clone {name}" : "Start {name}", { name: props.program.name })}
        </Text>
      </View>
      <View className="flex-row flex-wrap items-center">
        <Text noTranslate={true} className="mr-3 text-sm text-text-secondary">
          {Translate_format("by {author}", { author: props.program.author })}
        </Text>
        {externalUrl && (
          <Link className="text-sm text-text-secondary!" href={externalUrl}>
            Official site
          </Link>
        )}
      </View>
      {formattedTime && (
        <View className="flex-row items-center pb-1">
          <View className="pr-1">
            <IconWatch />
          </View>
          <Text noTranslate={true} className="flex-1 text-sm" style={{ paddingTop: 2 }}>
            {PersonalFormat_label("Average time of a workout:")}
            <Text noTranslate={true} className="text-sm font-bold">
              {formattedTime}
            </Text>
          </Text>
        </View>
      )}
      <SimpleMarkdown value={ProgramGuideLinks_rewrite(props.program.description, [])} className="mt-4 text-sm" />
      {props.onGuide && (
        <Pressable
          accessibilityRole="button"
          onPress={props.onGuide}
          testID="program-guide-open"
          data-testid="program-guide-open"
          className="flex-row items-center w-full px-4 mt-4 border rounded-lg border-border-line bg-background-surface"
          style={{ minHeight: 48 }}
        >
          <Text className="flex-1 text-sm font-semibold">Full description and FAQ</Text>
          <Text noTranslate={true} className="pl-3 text-lg text-text-secondary">
            ›
          </Text>
        </Pressable>
      )}
      <View className="flex-row justify-center gap-3 mt-4 mb-2">
        <Button
          name="preview-program"
          data-testid="preview-program"
          testID="preview-program"
          kind="grayv2"
          onClick={props.onPreview}
        >
          Preview
        </Button>
        <Button
          name="clone-program"
          kind="purple"
          data-testid="clone-program"
          testID="clone-program"
          onClick={props.onSelect}
        >
          {props.hasCustomPrograms ? "Clone" : "Start"}
        </Button>
      </View>
    </>
  );
}
