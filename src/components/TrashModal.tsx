import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TrashedDocument } from '@/src/types';

type Props = {
  visible: boolean;
  documents: TrashedDocument[];
  onClose: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onEmpty: () => void;
};

export function TrashModal({ visible, documents, onClose, onRestore, onDelete, onEmpty }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Recently deleted</Text>
              <Text style={styles.subtitle}>{documents.length} document{documents.length === 1 ? '' : 's'}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.headerButton}>
              <Text style={styles.accent}>Close</Text>
            </Pressable>
          </View>
          {documents.length ? (
            <>
              <ScrollView style={styles.list}>
                {documents.map((document) => (
                  <View key={document.id} style={styles.row}>
                    <View style={styles.copy}>
                      <Text style={styles.name} numberOfLines={2}>{document.name}</Text>
                      <Text style={styles.meta}>Deleted {new Date(document.deletedAt).toLocaleDateString()}</Text>
                    </View>
                    <Pressable onPress={() => onRestore(document.id)} style={styles.action}>
                      <Text style={styles.accent}>Restore</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => Alert.alert(
                        'Delete permanently?',
                        `“${document.name}” cannot be restored after this.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => onDelete(document.id) },
                        ],
                      )}
                      style={styles.action}>
                      <Text style={styles.danger}>Delete</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
              <Pressable
                onPress={() => Alert.alert('Empty trash?', 'These documents cannot be restored after this.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Empty trash', style: 'destructive', onPress: onEmpty },
                ])}
                style={styles.emptyButton}>
                <Text style={styles.danger}>Empty trash</Text>
              </Pressable>
            </>
          ) : <Text style={styles.empty}>Removed documents will appear here.</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.58)' },
  sheet: { maxHeight: '78%', minHeight: 300, backgroundColor: '#0F1419', borderColor: '#2A3441', borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerButton: { padding: 8 },
  title: { color: '#F4F1EA', fontSize: 21, fontWeight: '700' },
  subtitle: { color: '#9CA3AF', marginTop: 3 },
  list: { maxHeight: 420 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#1E2630', paddingVertical: 13 },
  copy: { flex: 1 },
  name: { color: '#F4F1EA', fontSize: 15, fontWeight: '600' },
  meta: { color: '#6B7280', fontSize: 12, marginTop: 3 },
  action: { padding: 8 },
  accent: { color: '#C4A574', fontWeight: '700' },
  danger: { color: '#E8A0A0', fontWeight: '700' },
  emptyButton: { alignSelf: 'flex-start', paddingVertical: 12, marginTop: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', paddingVertical: 60 },
});
