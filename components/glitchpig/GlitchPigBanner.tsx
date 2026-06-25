import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useGlitchPig } from '@/context/GlitchPigContext';

export default function GlitchPigBanner() {
  const router = useRouter();
  const { phase, progress, openArena } = useGlitchPig();

  if (phase !== 'invaded') return null;

  return (
    <Pressable
      style={styles.wrap}
      onPress={() => {
        openArena();
        router.push('/glitch-pig' as '/games/lola-run');
      }}>
      <Text style={styles.text}>
        👾 GLITCH ACTIVO · L-U-L-U-L-A ({progress}/6) · TAP
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FF0044',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
