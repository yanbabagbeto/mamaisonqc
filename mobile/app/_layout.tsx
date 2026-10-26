import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { I18nProvider, useI18n } from "../src/i18n";
import { colors, fontWeight } from "../src/theme";

export {
  // Catch any errors thrown by the layout tree (expo-router expects this export).
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootNavigator />
    </I18nProvider>
  );
}

function RootNavigator() {
  const { t } = useI18n();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: fontWeight.semibold, color: colors.ink },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="evaluation/[matricule]" options={{ title: t.evaluation.screenTitle }} />
        <Stack.Screen name="marche/[code]" options={{ title: t.market.regionScreenTitle }} />
        <Stack.Screen name="pre-marche/[id]" options={{ title: t.premarket.detailTitle }} />
      </Stack>
    </>
  );
}
