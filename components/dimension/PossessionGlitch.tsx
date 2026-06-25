import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useOinkDimension } from '@/context/OinkDimensionContext';

/** Glitch global cuando Lulula posee el wire */
export default function PossessionGlitch() {
  const router = useRouter();
  const { possession } = useOinkDimension();

  if (!possession.active) return null;

  return (
    <Pressable style={styles.wrap} onPress={() => router.push('/dimension' as '/games/lola-run')}>
      <View style={styles.glitchBar} />
      <Text style={styles.text}>👁 LULULA POSEE EL WIRE · TAP</Text>
      <View style={styles.glitchBar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    zIndex: 150,
    alignItems: 'center',
    gap: 4,
  },
  glitchBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#FF00AA',
    opacity: 0.7,
  },
  text: {
    backgroundColor: '#000000CC',
    color: '#FF00AA',
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingVertical: 10,
    letterSpacing: 1,
    overflow: 'hidden',
  },
});
