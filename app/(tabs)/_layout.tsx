import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0F1419' },
        headerTintColor: '#F4F1EA',
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#0F1419',
          borderTopColor: '#1E2630',
        },
        tabBarActiveTintColor: '#C4A574',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'books.vertical',
                android: 'menu_book',
                web: 'menu_book',
              }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'gearshape',
                android: 'settings',
                web: 'settings',
              }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
