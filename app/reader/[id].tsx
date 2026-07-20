import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reader</Text>
      <Text style={styles.subtitle}>Document: {id ?? 'unknown'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F4F1EA',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
