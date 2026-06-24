import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import AutoConnect from '@/components/AutoConnect';
import ConnectionBanner from '@/components/ConnectionBanner';
import { WA } from '@/constants/whatsappTheme';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <ConnectionBanner />
      <AutoConnect />
      <Tabs
        initialRouteName="chats"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: WA.teal,
          tabBarInactiveTintColor: WA.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
        }}>
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pulse"
          options={{
            title: 'Estados',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio-button-on" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Juegos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="game-controller" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Comunidades',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Ajustes',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WA.panel },
  tabBar: {
    backgroundColor: WA.header,
    borderTopColor: WA.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
