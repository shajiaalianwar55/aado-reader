import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReadingThemeId } from '@/src/types';
import { readingThemes, type ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  activeTheme: ReadingThemeId;
  brightness: number;
  onThemeChange: (theme: ReadingThemeId) => void;
  onBrightnessChange: (value: number) => void;
};

const STEPS = [0.55, 0.7, 0.85, 1];

export function ThemeControls({
  theme,
  activeTheme,
  brightness,
  onThemeChange,
  onBrightnessChange,
}: Props) {
  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Reading theme</Text>
      <View style={styles.row}>
        {(Object.keys(readingThemes) as ReadingThemeId[]).map((id) => {
          const active = id === activeTheme;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`${readingThemes[id].label} theme`}
              onPress={() => onThemeChange(id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.accent : theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.chipText, { color: active ? theme.background : theme.text }]}>
                {readingThemes[id].label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.label, { color: theme.textMuted }]}>Brightness</Text>
      <View style={styles.row}>
        {STEPS.map((step) => {
          const active = Math.abs(brightness - step) < 0.01;
          return (
            <Pressable
              key={step}
              accessibilityRole="button"
              accessibilityLabel={`Brightness ${Math.round(step * 100)} percent`}
              onPress={() => onBrightnessChange(step)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.accent : theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.chipText, { color: active ? theme.background : theme.text }]}>
                {Math.round(step * 100)}%
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
