import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { EconomyProvider } from '@/context/EconomyContext';
import { IdentityProvider } from '@/context/IdentityContext';
import { IRCProvider } from '@/context/IRCContext';
import { OinkWaveProvider } from '@/context/OinkWaveContext';
import { OinkDimensionProvider } from '@/context/OinkDimensionContext';
import { SnoutCastProvider } from '@/context/SnoutCastContext';
import { GlitchPigProvider } from '@/context/GlitchPigContext';
import { CollectiveMindProvider } from '@/context/CollectiveMindContext';
import { OinkSignalProvider } from '@/context/OinkSignalContext';
import OinkWaveArena from '@/components/oinkwave/OinkWaveArena';
import PossessionGlitch from '@/components/dimension/PossessionGlitch';
import SnoutCastEndCard from '@/components/snoutcast/SnoutCastEndCard';
import GlitchPigArena from '@/components/glitchpig/GlitchPigArena';
import ResonanceArena from '@/components/collectivemind/ResonanceArena';
import SignalDrop from '@/components/oinksignal/SignalDrop';
import { WA } from '@/constants/whatsappTheme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <IdentityProvider>
        <EconomyProvider>
          <GamificationProvider>
            <IRCProvider>
              <OinkWaveProvider>
                <OinkDimensionProvider>
                <SnoutCastProvider>
                <GlitchPigProvider>
                <CollectiveMindProvider>
                <OinkSignalProvider>
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
                <Stack.Screen name="dimension" options={{ animation: 'fade_from_bottom' }} />
                <Stack.Screen name="snoutcast" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="glitch-pig" options={{ animation: 'fade' }} />
                <Stack.Screen name="collective-mind" options={{ animation: 'fade_from_bottom' }} />
              </Stack>
              <OinkWaveArena />
              <PossessionGlitch />
              <SnoutCastEndCard />
              <GlitchPigArena />
              <ResonanceArena />
              <SignalDrop />
              </OinkSignalProvider>
              </CollectiveMindProvider>
              </GlitchPigProvider>
              </SnoutCastProvider>
              </OinkDimensionProvider>
              </OinkWaveProvider>
            </IRCProvider>
          </GamificationProvider>
        </EconomyProvider>
      </IdentityProvider>
    </AuthProvider>
  );
}
