import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  initialName: string;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export function RenameDocumentModal({ visible, initialName, onCancel, onSave }: Props) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Rename document</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            selectTextOnFocus
            accessibilityLabel="Document name"
            placeholder="Document name"
            placeholderTextColor="#6B7280"
            style={styles.input}
            onSubmitEditing={() => {
              const trimmed = name.trim();
              if (trimmed) onSave(trimmed);
            }}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const trimmed = name.trim();
                if (trimmed) onSave(trimmed);
              }}
              style={styles.primary}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#141A22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2630',
    padding: 20,
    gap: 12,
  },
  title: {
    color: '#F4F1EA',
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A3441',
    backgroundColor: '#0F1419',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F1EA',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  secondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  primary: {
    backgroundColor: '#C4A574',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryText: {
    color: '#0F1419',
    fontWeight: '700',
  },
});
