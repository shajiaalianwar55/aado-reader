import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to library</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1419',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F4F1EA',
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#C4A574',
  },
});
