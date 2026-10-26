import Constants from "expo-constants";
import { View } from "react-native";

import { resolveBaseUrl } from "../../src/api/client";
import {
  AppText,
  Card,
  DataRow,
  ListRow,
  Screen,
  ScreenIntro,
  SectionTitle,
  SegmentedControl,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import type { Language } from "../../src/i18n";
import { openExternal, webUrl } from "../../src/lib/links";
import { colors, spacing } from "../../src/theme";

/** Paramètres — language toggle (persisted), version, API address, legal pages. */
export default function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const baseUrl = resolveBaseUrl();
  const version = Constants.expoConfig?.version ?? "—";

  const legalLinks: ReadonlyArray<{ path: string; label: string }> = [
    { path: "/conditions", label: t.settings.legalTerms },
    { path: "/confidentialite", label: t.settings.legalPrivacy },
    { path: "/donnees", label: t.settings.legalData },
  ];

  return (
    <Screen>
      <ScreenIntro eyebrow={t.tabs.settings} title={t.settings.title} subtitle={t.settings.subtitle} />

      <Card>
        <SectionTitle>{t.settings.languageTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.settings.languageBody}
        </AppText>
        <SegmentedControl<Language>
          accessibilityLabel={t.settings.languageTitle}
          value={lang}
          onChange={(next) => void setLang(next)}
          options={[
            { value: "fr", label: t.settings.languageFr },
            { value: "en", label: t.settings.languageEn },
          ]}
        />
      </Card>

      <Card>
        <SectionTitle>{t.settings.versionTitle}</SectionTitle>
        <AppText variant="bodySmall" weight="semibold">
          {format(t.settings.versionLabel, { version })}
        </AppText>
        <DataRow label={t.settings.apiLabel} value={baseUrl} align="left" />
      </Card>

      <Card>
        <SectionTitle>{t.settings.legalTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.settings.legalBody}
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {legalLinks.map((link) => (
            <ListRow
              key={link.path}
              title={link.label}
              onPress={() => void openExternal(webUrl(baseUrl, link.path))}
            />
          ))}
        </View>
        <AppText variant="tiny" color={colors.inkSubtle}>
          {t.settings.legalNote}
        </AppText>
      </Card>

      <Card>
        <SectionTitle>{t.settings.aboutTitle}</SectionTitle>
        <AppText variant="bodySmall" color={colors.inkMuted} selectable>
          {t.settings.aboutBody}
        </AppText>
        <AppText variant="tiny" color={colors.inkSubtle}>
          {t.settings.madeWith}
        </AppText>
      </Card>
    </Screen>
  );
}
