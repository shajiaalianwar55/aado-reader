import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AnnotationColor, PageAnnotation } from '@/src/types';
import type { ThemeTokens } from '@/src/theme/readingThemes';

const COLORS: { id: AnnotationColor; label: string; value: string }[] = [
  { id: 'gold', label: 'Gold', value: '#E4B95F' },
  { id: 'rose', label: 'Rose', value: '#D9828C' },
  { id: 'mint', label: 'Mint', value: '#70BFA1' },
];

type Props = {
  visible: boolean;
  page: number;
  annotations: PageAnnotation[];
  theme: ThemeTokens;
  onClose: () => void;
  onSave: (note: string, color: AnnotationColor) => void;
  onDelete: (id: string) => void;
  onJump: (page: number) => void;
};

export function AnnotationPanel({
  visible, page, annotations, theme, onClose, onSave, onDelete, onJump,
}: Props) {
  const current = annotations.find((item) => item.page === page);
  const [note, setNote] = useState('');
  const [color, setColor] = useState<AnnotationColor>('gold');

  useEffect(() => {
    if (!visible) return;
    setNote(current?.note ?? '');
    setColor(current?.color ?? 'gold');
  }, [current, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Notes & highlights</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>Page {page}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}>
              <Text style={{ color: theme.accent }}>Close</Text>
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel={`Note for page ${page}`}
            multiline
            value={note}
            onChangeText={setNote}
            placeholder="Add a thought, quote, or reminder…"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
          />
          <View style={styles.colors}>
            {COLORS.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} highlight`}
                onPress={() => setColor(item.id)}
                style={[
                  styles.color,
                  { backgroundColor: item.value },
                  color === item.id && styles.colorActive,
                ]}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(note.trim(), color)}
              style={[styles.save, { backgroundColor: theme.accent }]}>
              <Text style={[styles.saveText, { color: theme.background }]}>Save page note</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.list}>
            {annotations.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>No annotations yet.</Text>
            ) : annotations.map((item) => (
              <View key={item.id} style={[styles.item, { borderColor: theme.border }]}>
                <Pressable onPress={() => onJump(item.page)} style={styles.itemMain}>
                  <View style={[styles.dot, { backgroundColor: COLORS.find((c) => c.id === item.color)?.value }]} />
                  <View style={styles.itemCopy}>
                    <Text style={[styles.page, { color: theme.accent }]}>Page {item.page}</Text>
                    <Text numberOfLines={2} style={[styles.note, { color: theme.text }]}>
                      {item.note || 'Highlighted page'}
                    </Text>
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => onDelete(item.id)}>
                  <Text style={{ color: theme.textMuted }}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { maxHeight: '82%', borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { marginTop: 3 },
  button: { padding: 8 },
  input: { minHeight: 100, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: 'top' },
  colors: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 14 },
  color: { width: 30, height: 30, borderRadius: 15 },
  colorActive: { borderWidth: 3, borderColor: '#FFFFFF' },
  save: { marginLeft: 'auto', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9 },
  saveText: { fontWeight: '700' },
  list: { maxHeight: 260 },
  empty: { paddingVertical: 20, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingVertical: 12 },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 34, borderRadius: 5, marginRight: 10 },
  itemCopy: { flex: 1 },
  page: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  note: { fontSize: 14 },
});
