import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  page: number;
  notes: Record<string, string>;
  onSave: (page: number, note: string) => void;
  onJump: (page: number) => void;
};

export function PageNotes({ theme, page, notes, onSave, onJump }: Props) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const entries = useMemo(
    () => Object.entries(notes).map(([key, text]) => ({ page: Number(key), text })).sort((a, b) => a.page - b.page),
    [notes],
  );

  useEffect(() => {
    if (visible) setDraft(notes[String(page)] ?? '');
  }, [notes, page, visible]);

  return (
    <>
      <View style={[styles.bar, { borderTopColor: theme.border, backgroundColor: theme.chrome }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Write a note for page ${page}`} onPress={() => setVisible(true)} style={styles.button}>
          <Text style={[styles.buttonText, { color: theme.accent }]}>{notes[String(page)] ? 'Edit page note' : 'Add page note'}</Text>
        </Pressable>
        <Text style={[styles.count, { color: theme.textMuted }]}>{entries.length} note{entries.length === 1 ? '' : 's'}</Text>
        {entries.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pages}>
            {entries.map((entry) => (
              <Pressable key={entry.page} accessibilityRole="button" accessibilityLabel={`Go to note on page ${entry.page}`} onPress={() => onJump(entry.page)}>
                <Text style={[styles.page, { color: theme.text, borderColor: theme.border }]}>p. {entry.page}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: theme.chrome, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Note for page {page}</Text>
            <TextInput
              autoFocus
              multiline
              value={draft}
              onChangeText={setDraft}
              placeholder="Capture a thought, quote, or question…"
              placeholderTextColor={theme.textMuted}
              accessibilityLabel={`Note for page ${page}`}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
            <View style={styles.actions}>
              <Pressable onPress={() => setVisible(false)} style={styles.action}><Text style={{ color: theme.textMuted }}>Cancel</Text></Pressable>
              {notes[String(page)] ? (
                <Pressable onPress={() => { onSave(page, ''); setVisible(false); }} style={styles.action}><Text style={styles.delete}>Delete</Text></Pressable>
              ) : null}
              <Pressable onPress={() => { onSave(page, draft.trim()); setVisible(false); }} style={[styles.action, { backgroundColor: theme.accent }]}>
                <Text style={styles.save}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 48, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  button: { paddingVertical: 7 }, buttonText: { fontWeight: '700', fontSize: 13 }, count: { fontSize: 12 }, pages: { gap: 6 },
  page: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  modal: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 14 }, title: { fontSize: 18, fontWeight: '700' },
  input: { minHeight: 130, borderWidth: 1, borderRadius: 10, padding: 12, textAlignVertical: 'top', fontSize: 15 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }, action: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9 },
  delete: { color: '#E8A0A0', fontWeight: '700' }, save: { color: '#0F1419', fontWeight: '700' },
});
