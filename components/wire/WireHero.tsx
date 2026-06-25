import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { WIRE_MANIFESTO } from '@/constants/oinkSignal';
import { WA } from '@/constants/whatsappTheme';
import { useCollectiveMind } from '@/context/CollectiveMindContext';
import { useOinkSignal } from '@/context/OinkSignalContext';
import { useOinkWave } from '@/context/OinkWaveContext';
import { useSnoutCast } from '@/context/SnoutCastContext';
import { useIRC } from '@/context/IRCContext';
import { useIdentity } from '@/context/IdentityContext';

type Props = {
  onJoinCity: () => void;
};

/** Hero del home — el wire está vivo */
export default function WireHero({ onJoinCity }: Props) {
  const { connectionState } = useIRC();
  const { cityName } = useIdentity();
  const { phase: signalPhase, secLeft, msUntilNext, leadingWord, openDrop, history } = useOinkSignal();
  const { phase: wavePhase } = useOinkWave();
  const { phase: mindPhase } = useCollectiveMind();
  const { active: snoutLive } = useSnoutCast();

  const liveCount = [
    signalPhase !== 'dormant',
    wavePhase === 'live' || wavePhase === 'countdown',
    mindPhase === 'active' || mindPhase === 'whisper',
    snoutLive,
  ].filter(Boolean).length;

  const isSignalLive = signalPhase === 'countdown' || signalPhase === 'live';
  const nextMin = Math.ceil(msUntilNext / 60000);
  const lastWord = history[0];

  return (
    <Pressable onPress={isSignalLive ? openDrop : onJoinCity}>
      <LinearGradient
        colors={isSignalLive ? ['#1a3d20', '#0B141A'] : ['#1a2030', '#0B141A']}
        style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.livePill}>
            <View style={[styles.dot, liveCount > 0 && styles.dotLive]} />
            <Text style={styles.liveText}>
              {liveCount > 0 ? `${liveCount} LIVE` : 'EL WIRE'}
            </Text>
          </View>
          <Text style={styles.city}>{cityName || 'Global'}</Text>
        </View>

        {isSignalLive ? (
          <>
            <Text style={styles.signalBadge}>📡 SEÑAL OINK</Text>
            <Text style={styles.signalTitle}>
              {signalPhase === 'countdown' ? 'La señal llega…' : 'UNA PALABRA. 60 SEGUNDOS.'}
            </Text>
            <Text style={styles.signalSub}>
              {signalPhase === 'live'
                ? `Lidera: ${leadingWord} · ${secLeft}s`
                : `Prepárate · ${secLeft}s`}
            </Text>
            <View style={styles.ctaRow}>
              <Text style={styles.cta}>ENTRAR AL DROP →</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.tagline}>{WIRE_MANIFESTO}</Text>
            {lastWord && (
              <Text style={styles.lastSignal}>
                Última señal: <Text style={styles.lastWord}>{lastWord.word.toUpperCase()}</Text> ·{' '}
                {lastWord.city}
              </Text>
            )}
            <Text style={styles.next}>Próxima señal en ~{nextMin} min</Text>
            <View style={styles.ctaRow}>
              <Text style={styles.cta}>
                {connectionState === 'connected' ? 'ENTRAR A TU CIUDAD →' : 'CONECTANDO…'}
              </Text>
            </View>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    padding: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: WA.border,
    gap: 6,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#555' },
  dotLive: { backgroundColor: '#FF0044' },
  liveText: { fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold', color: '#FF0044' },
  city: { fontSize: 10, fontFamily: 'Courier', color: WA.textSecondary },
  signalBadge: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#FFD700' },
  signalTitle: { fontSize: 18, fontFamily: 'Courier', fontWeight: 'bold', color: WA.text },
  signalSub: { fontSize: 12, fontFamily: 'Courier', color: WA.teal },
  tagline: { fontSize: 13, fontFamily: 'Courier', color: WA.text, lineHeight: 20 },
  lastSignal: { fontSize: 11, fontFamily: 'Courier', color: WA.textSecondary, marginTop: 4 },
  lastWord: { color: WA.teal, fontWeight: 'bold' },
  next: { fontSize: 10, fontFamily: 'Courier', color: '#666' },
  ctaRow: { marginTop: 8 },
  cta: { fontSize: 12, fontFamily: 'Courier', fontWeight: 'bold', color: WA.teal },
});
