import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useOinkWave } from '@/context/OinkWaveContext';
import { WA } from '@/constants/whatsappTheme';

/** Banner global — aparece en tabs cuando hay countdown o wave live */
export default function OinkWaveBanner() {
  const { phase, countdownSec, challenge, isMega, liveSecLeft, enterArena } = useOinkWave();

  if (phase === 'idle' || !challenge) return null;

  const isLive = phase === 'live';
  const label = isLive
    ? `🔴 OINK WAVE — ${liveSecLeft}s`
    : `⏳ Oink Wave en ${countdownSec}s`;

  return (
    <Pressable onPress={enterArena}>
      <LinearGradient
        colors={isMega ? ['#FF00AA', '#FF4466', '#FFAA00'] : ['#008069', '#00A884', '#25D366']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.wrap}>
        <View style={styles.row}>
          <Text style={styles.pulse}>{isLive ? '● LIVE' : '◉ SOON'}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {label} — {challenge.title}
          </Text>
        </View>
        <Text style={styles.sub}>
          {isLive ? 'Tu chat IRC es el juego · TAP' : 'Prepárate · tu sala de ciudad es la arena'}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 14, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulse: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: '#00000055',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 11, color: '#ffffffcc', marginTop: 4 },
});
