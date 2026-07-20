import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  visible: boolean;
  theme: ThemeTokens;
  title: string;
  onBack: () => void;
  topExtra?: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
  topInset: number;
  bottomInset: number;
};

export function ReaderChrome({
  visible,
  theme,
  title,
  onBack,
  topExtra,
  bottom,
  children,
  topInset,
  bottomInset,
}: Props) {
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {visible ? (
        <View
          style={[
            styles.topBar,
            {
              paddingTop: topInset + 8,
              backgroundColor: theme.chrome,
              borderBottomColor: theme.border,
            },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={8}
            style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.accent }]}>Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.chromeText }]} numberOfLines={1}>
            {title}
          </Text>
          {topExtra}
        </View>
      ) : (
        <View style={{ height: topInset }} />
      )}

      <View style={styles.stage}>{children}</View>

      {visible ? (
        <View style={{ paddingBottom: bottomInset, backgroundColor: theme.chrome }}>{bottom}</View>
      ) : (
        <View style={{ height: bottomInset }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontWeight: '600', fontSize: 16 },
  title: { flex: 1, fontSize: 15, fontWeight: '600' },
  stage: { flex: 1 },
});
