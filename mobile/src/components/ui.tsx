import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type {
  AccessibilityRole,
  KeyboardTypeOptions,
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isApiError } from "../api/client";
import { useI18n } from "../i18n";
import { colors, fontSize, fontWeight, layout, lineHeight, radii, shadow, spacing } from "../theme";

/**
 * Shared UI primitives for MaMaisonQC mobile.
 *
 * Rules enforced here (not in every screen):
 * - every interactive element is at least 44 pt tall (`layout.touch`);
 * - inputs always have a visible label + `accessibilityLabel`, and errors are announced;
 * - loading / empty / error states are designed components, never raw text;
 * - the content column is capped at `layout.maxContentWidth` and centred on tablets.
 */

type TextVariant = "hero" | "display" | "title" | "section" | "body" | "bodySmall" | "caption" | "tiny";

const variantStyles: Record<TextVariant, TextStyle> = {
  hero: { fontSize: fontSize.hero, lineHeight: fontSize.hero * lineHeight.tight, fontWeight: fontWeight.bold },
  display: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  title: { fontSize: fontSize.title, lineHeight: fontSize.title * lineHeight.tight, fontWeight: fontWeight.semibold },
  section: {
    fontSize: fontSize.section,
    lineHeight: fontSize.section * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  },
  body: { fontSize: fontSize.body, lineHeight: fontSize.body * lineHeight.normal, fontWeight: fontWeight.regular },
  bodySmall: {
    fontSize: fontSize.bodySmall,
    lineHeight: fontSize.bodySmall * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  tiny: { fontSize: fontSize.tiny, lineHeight: fontSize.tiny * lineHeight.normal, fontWeight: fontWeight.medium },
};

export function AppText({
  children,
  variant = "body",
  color = colors.ink,
  weight,
  style,
  accessibilityRole,
  accessibilityLiveRegion,
  numberOfLines,
  selectable,
}: {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof fontWeight;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLiveRegion?: "none" | "polite" | "assertive";
  numberOfLines?: number;
  selectable?: boolean;
}) {
  return (
    <Text
      style={[variantStyles[variant], { color }, weight ? { fontWeight: fontWeight[weight] } : null, style]}
      accessibilityRole={accessibilityRole}
      accessibilityLiveRegion={accessibilityLiveRegion}
      numberOfLines={numberOfLines}
      selectable={selectable}
    >
      {children}
    </Text>
  );
}

/** Screen scaffold: safe area, capped content column, optional pull-to-refresh. */
export function Screen({
  children,
  topInset = true,
  refreshing = false,
  onRefresh,
  style,
}: {
  children: ReactNode;
  topInset?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={topInset ? ["top"] : []}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, style]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        <View style={styles.contentColumn}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Eyebrow + title + subtitle used at the top of every tab screen. */
export function ScreenIntro({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.intro}>
      {eyebrow ? <Badge label={eyebrow} tone="accent" /> : null}
      <AppText variant="hero" accessibilityRole="header" style={styles.introTitle}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.inkMuted}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="section" accessibilityRole="header" style={styles.sectionTitle}>
        {children}
      </AppText>
      {right}
    </View>
  );
}

export function Card({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.card, styles.cardPressedTarget, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  label,
  onPress,
  tone = "primary",
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const isInactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        toneStyles[tone],
        pressed && !isInactive && styles.pressed,
        isInactive && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === "primary" || tone === "danger" ? colors.white : colors.primary} />
      ) : (
        <AppText
          variant="body"
          weight="semibold"
          color={tone === "primary" || tone === "danger" ? colors.white : colors.primary}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const toneStyles: Record<ButtonTone, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.lineStrong },
  danger: { backgroundColor: colors.danger },
};

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const badgeTones: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.overlay, text: colors.inkMuted },
  success: { background: colors.successSoft, text: colors.success },
  warning: { background: colors.warningSoft, text: colors.warning },
  danger: { background: colors.dangerSoft, text: colors.danger },
  accent: { background: colors.accentSoft, text: colors.accent },
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const palette = badgeTones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppText variant="tiny" color={palette.text} weight="semibold">
        {label}
      </AppText>
    </View>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color={colors.inkMuted}>
        {label}
      </AppText>
      <AppText variant="title" style={styles.statValue}>
        {value}
      </AppText>
      {hint ? (
        <AppText variant="tiny" color={colors.inkSubtle}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

/** Label/value row used in record cards and provenance blocks. */
export function DataRow({ label, value, align = "right" }: { label: string; value: string; align?: "left" | "right" }) {
  return (
    <View style={styles.dataRow}>
      <AppText variant="bodySmall" color={colors.inkMuted} style={styles.dataRowLabel}>
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        weight="semibold"
        selectable
        style={[styles.dataRowValue, align === "left" && styles.dataRowValueLeft]}
      >
        {value}
      </AppText>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete,
  textContentType,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  maxLength?: number;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: () => void;
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" weight="semibold" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        accessibilityLabel={label}
        accessibilityHint={hint}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.inkSubtle}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.centeredState} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText variant="bodySmall" color={colors.inkMuted}>
        {label}
      </AppText>
    </View>
  );
}

/** Error state with an API-aware message: `ApiError.code` is localized, everything else generic. */
export function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry?: () => void;
}) {
  const { t, errorMessage } = useI18n();
  const message = isApiError(error) ? errorMessage(error.code) : t.errors.UNKNOWN;
  return (
    <Card style={styles.stateCard}>
      <AppText variant="section" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="bodySmall" color={colors.inkMuted}>
        {message}
      </AppText>
      {onRetry ? (
        <Button label={t.common.retry} onPress={onRetry} tone="secondary" style={styles.stateButton} />
      ) : null}
    </Card>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card style={styles.stateCard}>
      <AppText variant="section" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="bodySmall" color={colors.inkMuted}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} tone="secondary" style={styles.stateButton} />
      ) : null}
    </Card>
  );
}

/** Horizontal bar for a price band or a distribution bucket. */
export function BandBar({
  label,
  valueLabel,
  ratio,
  accessibilityLabel,
}: {
  label: string;
  valueLabel: string;
  ratio: number;
  accessibilityLabel: string;
}) {
  const width = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  return (
    <View style={styles.bandRow} accessible accessibilityLabel={accessibilityLabel} accessibilityRole="text">
      <View style={styles.bandHeader}>
        <AppText variant="caption" color={colors.inkMuted}>
          {label}
        </AppText>
        <AppText variant="caption" weight="semibold">
          {valueLabel}
        </AppText>
      </View>
      <View style={styles.bandTrack}>
        <View style={[styles.bandFill, { width: `${width * 100}%` }]} />
      </View>
    </View>
  );
}

/** Pressable row used for lists (regions, municipalities, listings). */
export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, subtitle, meta].filter(Boolean).join(", ")}
      style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}
    >
      <View style={styles.listRowBody}>
        <AppText variant="body" weight="semibold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.inkMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {meta ? (
        <AppText variant="caption" color={colors.inkSubtle} style={styles.listRowMeta}>
          {meta}
        </AppText>
      ) : null}
    </Pressable>
  );
}

/** Two-state segmented control (language, filters). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <AppText
              variant="bodySmall"
              weight={selected ? "semibold" : "regular"}
              color={selected ? colors.white : colors.inkMuted}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { paddingBottom: spacing.huge, flexGrow: 1 },
  contentColumn: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    gap: spacing.lg,
  },
  intro: { gap: spacing.sm, paddingTop: spacing.md },
  introTitle: { marginTop: spacing.xs },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: { flexShrink: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadow.card,
  },
  cardPressedTarget: { overflow: "hidden" },
  pressed: { opacity: 0.86 },
  button: {
    minHeight: layout.touch,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.55 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stat: { flexGrow: 1, flexBasis: "45%", gap: spacing.xs },
  statValue: { fontSize: fontSize.title },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  dataRowLabel: { flexShrink: 1 },
  dataRowValue: { flexShrink: 1, textAlign: "right", flexGrow: 1 },
  dataRowValueLeft: { textAlign: "left" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: spacing.xs },
  field: { gap: spacing.xs },
  fieldLabel: { letterSpacing: 0.2 },
  input: {
    minHeight: layout.touch,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  inputMultiline: { minHeight: layout.touch * 2.5, textAlignVertical: "top" },
  inputError: { borderColor: colors.danger },
  inputDisabled: { opacity: 0.6 },
  centeredState: { alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.huge },
  stateCard: { alignItems: "flex-start", gap: spacing.sm },
  stateButton: { alignSelf: "flex-start", marginTop: spacing.xs },
  bandRow: { gap: spacing.xs },
  bandHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  bandTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
  },
  bandFill: { height: "100%", backgroundColor: colors.primary, borderRadius: radii.pill },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: layout.touch,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  listRowBody: { flex: 1, gap: spacing.xxs },
  listRowMeta: { maxWidth: "40%", textAlign: "right" },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: layout.touch - 8,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: { backgroundColor: colors.primary },
});
