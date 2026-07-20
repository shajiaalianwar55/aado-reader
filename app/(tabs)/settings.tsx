import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading defaults</Text>
      <Text style={styles.subtitle}>Preferences for new documents will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F4F1EA',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
});
