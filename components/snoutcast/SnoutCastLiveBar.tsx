import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSnoutCast } from '@/context/SnoutCastContext';
import { WA } from '@/constants/whatsappTheme';

/** Barra estilo “Instagram Live” — quién tiene el hocico en tu ciudad */
export default function SnoutCastLiveBar() {
  const router = useRouter();
  const { active, broadcaster, secLeft, oinkReactions, listeners, isYouOnAir } = useSnoutCast();

  if (!active || !broadcaster) return null;

  return (
    <Pressable onPress={() => router.push('/snoutcast' as '/games/lola-run')}>
      <LinearGradient
        colors={isYouOnAir ? ['#FF00AA', '#FF4466'] : ['#1a1a2e', '#2d1b4e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.wrap}>
        <View style={styles.liveRing}>
          <View style={styles.liveDot} />
        </View>
        <View style={styles.body}>
          <Text style={styles.label}>
            {isYouOnAir ? '🎙️ TÚ EN EL AIRE' : `🎙️ EN VIVO · ${broadcaster}`}
          </Text>
          <Text style={styles.meta}>
            {secLeft}s · {oinkReactions} 🐷 · {listeners} escuchando
          </Text>
        </View>
        <Text style={styles.tap}>TAP →</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FF00AA66',
  },
  liveRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#FF4466',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4466',
  },
  body: { flex: 1 },
  label: { fontSize: 14, fontWeight: '800', color: '#fff' },
  meta: { fontSize: 11, color: '#ffffffaa', marginTop: 2 },
  tap: { fontSize: 12, fontWeight: '700', color: WA.teal },
});
