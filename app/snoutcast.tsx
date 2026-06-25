import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND } from '@/constants/config';
import { randomTagline, SNOUTCAST_SHARE } from '@/constants/snoutCast';
import { getCity } from '@/constants/world';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';
import { useSnoutCast } from '@/context/SnoutCastContext';
import { WA } from '@/constants/whatsappTheme';

/** Estudio SnoutCast — la radio pirata de tu ciudad */
export default function SnoutCastScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityId, cityName, tribeEmoji } = useIdentity();
  const { sendChannel } = useIRC();
  const {
    active,
    broadcaster,
    secLeft,
    oinkReactions,
    listeners,
    isYouOnAir,
    queue,
    sessionsTotal,
    claimAir,
  } = useSnoutCast();

  const pulse = useRef(new Animated.Value(1)).current;
  const city = cityId ? getCity(cityId) : null;
  const tagline = randomTagline(Date.now());

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const sendOink = () => {
    if (!city) return;
    sendChannel(city.channel, '🐷 oink');
  };

  const share = async () => {
    if (!broadcaster) return;
    const msg = SNOUTCAST_SHARE(cityName, broadcaster, oinkReactions, listeners);
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#1a0010', '#0a0a1a', '#000']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>SNOUTCAST</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.tagline}>{tagline}</Text>

        <Animated.View style={[styles.micWrap, active && { transform: [{ scale: pulse }] }]}>
          <LinearGradient colors={['#FF00AA', '#FF4466']} style={styles.micRing}>
            <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.mascot} />
          </LinearGradient>
        </Animated.View>

        {active ? (
          <>
            <Text style={styles.onAir}>● EN EL AIRE</Text>
            <Text style={styles.broadcaster}>{broadcaster}</Text>
            <Text style={styles.timer}>{secLeft}s</Text>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>🐷 {oinkReactions}</Text>
              <Text style={styles.stat}>👂 {listeners}</Text>
              <Text style={styles.stat}>📋 {queue.length} en fila</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.idleTitle}>El micrófono está libre</Text>
            <Text style={styles.idleSub}>
              Escribe <Text style={styles.cmd}>/hog</Text> en {city?.channel ?? 'tu sala'} y toma el aire por{' '}
              90 segundos.
            </Text>
          </>
        )}

        <View style={styles.howBox}>
          <Text style={styles.howTitle}>CÓMO FUNCIONA (único en el mundo)</Text>
          <Text style={styles.howLine}>1. Un solo hocico en el aire por ciudad</Text>
          <Text style={styles.howLine}>2. Comando IRC: /hog /air /enelaire</Text>
          <Text style={styles.howLine}>3. La gente reacciona con 🐷 en el chat</Text>
          <Text style={styles.howLine}>4. Fila automática — el caos ordenado</Text>
          <Text style={styles.howLine}>5. WhatsApp tiene estados. Esto es radio pirata.</Text>
        </View>

        {!active && (
          <Pressable style={styles.claimBtn} onPress={claimAir}>
            <Text style={styles.claimText}>🎙️ TOMAR EL AIRE (/hog)</Text>
          </Pressable>
        )}

        {active && !isYouOnAir && (
          <Pressable style={styles.oinkBtn} onPress={sendOink}>
            <Text style={styles.oinkText}>🐷 MANDAR OINK</Text>
          </Pressable>
        )}

        {active && isYouOnAir && (
          <Pressable style={styles.shareBtn} onPress={share}>
            <Text style={styles.shareText}>📣 Compartir que estás EN EL AIRE</Text>
          </Pressable>
        )}

        <Text style={styles.footer}>
          {cityName} {tribeEmoji} · {sessionsTotal} sesiones tuyas en el aire
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontSize: 28, color: WA.text },
  title: { fontSize: 16, fontWeight: '900', color: '#FF00AA', letterSpacing: 4 },
  scroll: { padding: 20, alignItems: 'center', gap: 12, paddingBottom: 40 },
  tagline: { fontSize: 13, color: WA.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  micWrap: { marginVertical: 16 },
  micRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  mascot: { width: 120, height: 120, borderRadius: 60 },
  onAir: { fontSize: 12, fontWeight: '900', color: '#FF4466', letterSpacing: 2 },
  broadcaster: { fontSize: 28, fontWeight: '800', color: WA.text },
  timer: { fontSize: 48, fontWeight: '900', color: WA.teal },
  statsRow: { flexDirection: 'row', gap: 20 },
  stat: { fontSize: 16, color: WA.text },
  idleTitle: { fontSize: 22, fontWeight: '700', color: WA.text },
  idleSub: { fontSize: 14, color: WA.textSecondary, textAlign: 'center', lineHeight: 22 },
  cmd: { fontFamily: 'Courier', color: WA.teal, fontWeight: '700' },
  howBox: {
    width: '100%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#FF00AA44',
    padding: 16,
    gap: 6,
    marginTop: 8,
  },
  howTitle: { fontSize: 11, fontWeight: '800', color: '#FF00AA', marginBottom: 4 },
  howLine: { fontSize: 12, color: WA.textSecondary, fontFamily: 'Courier' },
  claimBtn: {
    backgroundColor: '#FF00AA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  claimText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  oinkBtn: {
    backgroundColor: WA.inputBg,
    borderWidth: 2,
    borderColor: WA.teal,
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  oinkText: { fontSize: 16, fontWeight: '700', color: WA.teal },
  shareBtn: {
    backgroundColor: WA.green,
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  shareText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  footer: { fontSize: 11, color: WA.textSecondary, marginTop: 16 },
});
