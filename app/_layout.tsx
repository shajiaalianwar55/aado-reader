import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F1419' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="reader/[id]"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
