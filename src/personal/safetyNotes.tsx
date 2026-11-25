import { JSX, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../components/primitives/text";
import { IconClose } from "../components/icons/iconClose";
import { Tailwind_semantic } from "../utils/tailwindConfig";
import { DateUtils_format } from "../utils/date";
import { Translate_format, Translate_text } from "../i18n/translate";
import {
  PersonalSafety_backupReminder,
  PersonalSafety_currentStandalone,
  PersonalSafety_dismissInstallHint,
  PersonalSafety_exportedEvent,
  PersonalSafety_lastExport,
  PersonalSafety_isInstallHintDismissed,
  PersonalSafety_isIos,
  PersonalSafety_showInstallHint,
} from "./safety";

// personal-fork: Safari can clear a tab's data after 7 days unused; an installed web app keeps it
export function PersonalInstallHint(): JSX.Element | null {
  const [isShown, setIsShown] = useState(() =>
    PersonalSafety_showInstallHint(PersonalSafety_currentStandalone(), PersonalSafety_isInstallHintDismissed())
  );
  const isIos =
    typeof navigator !== "undefined" && PersonalSafety_isIos(navigator.userAgent, navigator.maxTouchPoints || 0);
  if (!isShown) {
    return null;
  }
  return (
    <View
      testID="install-hint"
      data-testid="install-hint"
      className="flex-row items-center mt-3 border rounded-lg border-border-neutral bg-background-surface"
    >
      <View className="flex-1 py-2 pl-3">
        <Text className="text-sm text-text-secondary">
          Add to Home Screen to keep your records safer (Share → Add to Home Screen).
        </Text>
        {isIos && (
          <Text className="mt-1 text-sm text-text-secondary">
            Records made in Safari stay in Safari: export them on the Me screen, then import them in the Home Screen
            app.
          </Text>
        )}
      </View>
      <Pressable
        testID="install-hint-close"
        data-testid="install-hint-close"
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="items-center justify-center"
        style={{ width: 44, height: 44 }}
        onPress={() => {
          PersonalSafety_dismissInstallHint();
          setIsShown(false);
        }}
      >
        <IconClose size={14} color={Tailwind_semantic().text.secondary} />
      </Pressable>
    </View>
  );
}

export function PersonalBackupNote(): JSX.Element {
  const [lastExport, setLastExport] = useState(() => PersonalSafety_lastExport());
  useEffect(() => {
    const onExported = (): void => setLastExport(PersonalSafety_lastExport());
    window.addEventListener(PersonalSafety_exportedEvent, onExported);
    return () => window.removeEventListener(PersonalSafety_exportedEvent, onExported);
  }, []);
  const reminder = PersonalSafety_backupReminder(lastExport, Date.now());
  return (
    <View testID="backup-note" data-testid="backup-note" className="pb-3 -mt-1">
      <Text noTranslate={true} className="text-sm text-text-secondary" style={{ fontVariant: ["tabular-nums"] }}>
        {reminder.lastExport != null
          ? Translate_format("Last exported: {date}", { date: DateUtils_format(reminder.lastExport) })
          : Translate_text("Not exported yet")}
      </Text>
      {reminder.isDue && (
        <Text className="mt-0.5 text-sm font-semibold text-text-primary">
          Export now and keep the file somewhere safe.
        </Text>
      )}
    </View>
  );
}
