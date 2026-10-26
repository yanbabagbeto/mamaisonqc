import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText, Screen } from "../src/components/ui";
import { useI18n } from "../src/i18n";
import { colors, spacing } from "../src/theme";

export default function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: t.common.appName }} />
      <Screen>
        <View style={styles.block}>
          <AppText variant="display" accessibilityRole="header">
            {t.errors.NOT_FOUND}
          </AppText>
          <Link href="/" style={styles.link} accessibilityRole="link">
            <AppText variant="body" color={colors.primary} weight="semibold">
              {t.common.back}
            </AppText>
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.lg, paddingTop: spacing.xxl },
  link: { minHeight: 44, justifyContent: "center" },
});
