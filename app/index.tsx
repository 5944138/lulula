import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import LululaLogo from '@/components/brand/LululaLogo';
import { WA } from '@/constants/whatsappTheme';
import { useAuth } from '@/context/AuthContext';
import { useIdentity } from '@/context/IdentityContext';

export default function Index() {
  const { authDone, ready: authReady } = useAuth();
  const { onboardingDone, ready: idReady } = useIdentity();

  if (!authReady || !idReady) {
    return (
      <View style={styles.boot}>
        <LululaLogo size="hero" />
        <ActivityIndicator size="large" color={WA.teal} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!authDone || !onboardingDone) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)/chats" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: WA.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
