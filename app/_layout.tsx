import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { EconomyProvider } from '@/context/EconomyContext';
import { IdentityProvider } from '@/context/IdentityContext';
import { IRCProvider } from '@/context/IRCContext';
import { WA } from '@/constants/whatsappTheme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <IdentityProvider>
        <EconomyProvider>
          <GamificationProvider>
            <IRCProvider>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: WA.bg },
                  animation: 'fade',
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="connect" options={{ animation: 'none' }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="games" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="shop" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="channel/[name]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="query/[nick]" options={{ animation: 'slide_from_right' }} />
              </Stack>
            </IRCProvider>
          </GamificationProvider>
        </EconomyProvider>
      </IdentityProvider>
    </AuthProvider>
  );
}
