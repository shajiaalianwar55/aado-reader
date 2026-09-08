import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  visible: boolean;
  documentName: string;
  initialCollection?: string;
  onCancel: () => void;
  onSave: (collection: string) => void;
};

export function CollectionModal({
  visible,
  documentName,
  initialCollection = '',
  onCancel,
  onSave,
}: Props) {
  const [collection, setCollection] = useState(initialCollection);

  useEffect(() => {
    if (visible) setCollection(initialCollection);
  }, [initialCollection, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Organize document</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{documentName}</Text>
          <TextInput
            autoFocus
            value={collection}
            onChangeText={setCollection}
            onSubmitEditing={() => onSave(collection.trim())}
            placeholder="Collection name"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Collection name"
            maxLength={40}
            style={styles.input}
          />
          <Text style={styles.hint}>Leave blank to remove this document from its collection.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.button}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(collection.trim())}
              style={[styles.button, styles.saveButton]}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3441',
    backgroundColor: '#141A22',
    padding: 20,
  },
  title: { color: '#F4F1EA', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 5, marginBottom: 18 },
  input: {
    color: '#F4F1EA',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3441',
    backgroundColor: '#0F1419',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  hint: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  button: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 9 },
  saveButton: { backgroundColor: '#C4A574' },
  cancelText: { color: '#9CA3AF', fontWeight: '700' },
  saveText: { color: '#0F1419', fontWeight: '700' },
});
