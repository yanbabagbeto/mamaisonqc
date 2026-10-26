import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useI18n } from "../../src/i18n";
import { colors, fontWeight } from "../../src/theme";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * React Navigation types the icon colour as a platform `ColorValue` (string | number | null);
 * Ionicons only accepts strings/opaque colours. Anything that is not a plain string falls back to
 * the token colour instead of being cast blindly.
 */
function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: unknown; size: number }) {
    return (
      <Ionicons name={name} size={size} color={typeof color === "string" ? color : colors.inkSubtle} />
    );
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: fontWeight.semibold },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarAccessibilityLabel: t.tabs.home,
          tabBarIcon: tabIcon("home-outline"),
        }}
      />
      <Tabs.Screen
        name="marche"
        options={{
          title: t.tabs.market,
          tabBarAccessibilityLabel: t.tabs.market,
          tabBarIcon: tabIcon("stats-chart-outline"),
        }}
      />
      <Tabs.Screen
        name="pre-marche"
        options={{
          title: t.tabs.premarket,
          tabBarAccessibilityLabel: t.tabs.premarket,
          tabBarIcon: tabIcon("eye-outline"),
        }}
      />
      <Tabs.Screen
        name="proprietaire"
        options={{
          title: t.tabs.owner,
          tabBarAccessibilityLabel: t.tabs.owner,
          tabBarIcon: tabIcon("calculator-outline"),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: t.tabs.settings,
          tabBarAccessibilityLabel: t.tabs.settings,
          tabBarIcon: tabIcon("settings-outline"),
        }}
      />
    </Tabs>
  );
}
