import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SignalProvider } from '@/context/OinkSignalContext';
import { MircColors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <SignalProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: MircColors.chatBg },
          animation: 'fade',
        }}>
        <Stack.Screen name="index" />
      </Stack>
    </SignalProvider>
  );
}
