import { StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  visible: boolean;
  theme: ThemeTokens;
  bottomInset: number;
};

export function ChromeTapHint({ visible, theme, bottomInset }: Props) {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 12) + 8 }]}>
      <Text style={[styles.text, { color: theme.textMuted, backgroundColor: theme.chrome }]}>
        Tap page to show controls
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    opacity: 0.92,
  },
});
