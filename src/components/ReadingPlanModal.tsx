import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { createReadingTarget } from '@/src/lib/readingPlan';

type Props = {
  visible: boolean;
  documentName: string;
  targetDate?: number;
  onCancel: () => void;
  onSave: (targetDate?: number) => void;
};

export function ReadingPlanModal({
  visible,
  documentName,
  targetDate,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Set a finish plan</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{documentName}</Text>
          {targetDate ? (
            <Text style={styles.current}>
              Current target: {new Date(targetDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          ) : null}
          <Text style={styles.label}>Finish in</Text>
          <View style={styles.options}>
            {[7, 14, 30].map((days) => (
              <Pressable
                key={days}
                accessibilityRole="button"
                accessibilityLabel={`Finish in ${days} days`}
                onPress={() => onSave(createReadingTarget(days))}
                style={styles.option}>
                <Text style={styles.optionText}>{days} days</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actions}>
            {targetDate ? (
              <Pressable onPress={() => onSave(undefined)} style={styles.action}>
                <Text style={styles.clear}>Clear plan</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onCancel} style={styles.action}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.68)' },
  card: { backgroundColor: '#141A22', borderColor: '#2A3441', borderWidth: 1, borderRadius: 16, padding: 20 },
  title: { color: '#F4F1EA', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 5 },
  current: { color: '#70BFA1', fontSize: 13, fontWeight: '600', marginTop: 12 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 10 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, alignItems: 'center', backgroundColor: '#C4A574', borderRadius: 9, paddingVertical: 12 },
  optionText: { color: '#0F1419', fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 18 },
  action: { paddingHorizontal: 12, paddingVertical: 9 },
  clear: { color: '#E8A0A0', fontWeight: '700' },
  cancel: { color: '#9CA3AF', fontWeight: '700' },
});
