import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { DocumentRating } from '@/src/types';

type Props = {
  visible: boolean;
  documentName: string;
  rating?: DocumentRating;
  onCancel: () => void;
  onSave: (rating?: DocumentRating) => void;
};

const RATINGS: DocumentRating[] = [1, 2, 3, 4, 5];

export function RatingModal({ visible, documentName, rating, onCancel, onSave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Rate document</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{documentName}</Text>
          <View style={styles.ratings}>
            {RATINGS.map((value) => {
              const active = value <= (rating ?? 0);
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${value} out of 5 stars`}
                  accessibilityState={{ selected: rating === value }}
                  onPress={() => onSave(value)}
                  hitSlop={6}
                  style={styles.starButton}>
                  <Text style={[styles.star, active && styles.starActive]}>★</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actions}>
            {rating ? (
              <Pressable accessibilityRole="button" onPress={() => onSave()} style={styles.button}>
                <Text style={styles.clearText}>Clear rating</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.button}>
              <Text style={styles.cancelText}>Cancel</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3441',
    backgroundColor: '#141A22',
    padding: 20,
  },
  title: { color: '#F4F1EA', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 5, marginBottom: 18 },
  ratings: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  starButton: { padding: 5 },
  star: { color: '#3A4655', fontSize: 34 },
  starActive: { color: '#C4A574' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  button: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  clearText: { color: '#E8A0A0', fontWeight: '700' },
  cancelText: { color: '#9CA3AF', fontWeight: '700' },
});
