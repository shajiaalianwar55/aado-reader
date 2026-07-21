import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clearLibrary, loadSettings, saveSettings } from '@/src/store/libraryStore';
import { readingThemes } from '@/src/theme/readingThemes';
import { defaultSettings } from '@/src/store/constants';
import type { FitMode, ReaderSettings, ReadingThemeId, ScrollMode } from '@/src/types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((value) => {
      setSettings(value);
      setLoaded(true);
    });
  }, []);

  const update = useCallback(async (patch: Partial<ReaderSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next).catch(() => undefined);
      return next;
    });
  }, []);

  const onClearLibrary = useCallback(() => {
    Alert.alert(
      'Clear library?',
      'This removes all recent documents from Aado. The PDF files on your device are not deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearLibrary();
            Alert.alert('Library cleared', 'Your recent documents list is empty.');
          },
        },
      ],
    );
  }, []);

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Loading preferences…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>Aado</Text>
      <Text style={styles.title}>Reading defaults</Text>
      <Text style={styles.subtitle}>
        These preferences apply when you open a new document.
      </Text>

      <Text style={styles.section}>Theme</Text>
      <View style={styles.row}>
        {(Object.keys(readingThemes) as ReadingThemeId[]).map((id) => {
          const active = settings.theme === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`${readingThemes[id].label} default theme`}
              onPress={() => update({ theme: id })}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {readingThemes[id].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Fit mode</Text>
      <View style={styles.row}>
        {(['width', 'page'] as FitMode[]).map((mode) => {
          const active = settings.fitMode === mode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`Default fit ${mode}`}
              onPress={() => update({ fitMode: mode })}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {mode === 'width' ? 'Fit width' : 'Fit page'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Scroll mode</Text>
      <View style={styles.row}>
        {(['vertical', 'paged'] as ScrollMode[]).map((mode) => {
          const active = settings.scrollMode === mode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`Default ${mode} mode`}
              onPress={() => update({ scrollMode: mode })}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {mode === 'vertical' ? 'Continuous' : 'Paged'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.switchTitle}>Keep screen awake</Text>
          <Text style={styles.switchBody}>Prevents sleep while reading</Text>
        </View>
        <Switch
          accessibilityLabel="Keep screen awake while reading"
          value={settings.keepAwake}
          onValueChange={(keepAwake) => update({ keepAwake })}
          trackColor={{ false: '#2A3441', true: '#C4A574' }}
          thumbColor="#F4F1EA"
        />
      </View>

      <Text style={styles.section}>Brightness</Text>
      <View style={styles.row}>
        {[0.55, 0.7, 0.85, 1].map((step) => {
          const active = Math.abs(settings.brightness - step) < 0.01;
          return (
            <Pressable
              key={step}
              accessibilityRole="button"
              accessibilityLabel={`Default brightness ${Math.round(step * 100)} percent`}
              onPress={() => update({ brightness: step })}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {Math.round(step * 100)}%
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Library</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear recent library"
        onPress={onClearLibrary}
        style={styles.dangerBtn}>
        <Text style={styles.dangerText}>Clear recent documents</Text>
      </Pressable>
      <Text style={styles.hint}>Does not delete PDF files from your device.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: '#C4A574',
    letterSpacing: -1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F4F1EA',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#141A22',
    borderWidth: 1,
    borderColor: '#1E2630',
  },
  chipActive: {
    backgroundColor: '#C4A574',
    borderColor: '#C4A574',
  },
  chipText: {
    color: '#E8EAED',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0F1419',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    color: '#F4F1EA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchBody: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  dangerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#4A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  dangerText: {
    color: '#E8A0A0',
    fontWeight: '700',
    fontSize: 14,
  },
  hint: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 24,
  },
});
