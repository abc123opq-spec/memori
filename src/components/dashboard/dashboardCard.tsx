import { JSX, ReactNode } from "react";
import { View } from "react-native";
import { Markdown } from "../markdown";
import { Translate_text } from "../../i18n/translate";

export function DashboardCard(props: { caption?: string; children: ReactNode; testID?: string }): JSX.Element {
  return (
    <View
      testID={props.testID}
      className="flex-1 p-3 border rounded-xl bg-background-subtlecardpurple border-border-cardpurple"
    >
      {props.caption != null ? <Markdown value={Translate_text(props.caption)} className="mb-1" isHtmlDisabled /> : null}
      {props.children}
    </View>
  );
}
