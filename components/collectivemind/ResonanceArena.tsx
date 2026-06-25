import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BRAND } from '@/constants/config';
import { RESONANCE_GOAL, RESONANCE_SHARE } from '@/constants/collectiveMind';
import { useCollectiveMind } from '@/context/CollectiveMindContext';

/** Fullscreen — la ciudad resuena con el deseo mundial */
export default function ResonanceArena() {
  const {
    phase,
    desire,
    mega,
    progress,
    rivalProgress,
    rivalName,
    secLeft,
    worldSouls,
    streak,
    personalContribution,
    lululaWhisper,
    result,
    arenaOpen,
    closeArena,
    dismissCelebration,
    submitDesire,
    cityName,
  } = useCollectiveMind();

  if (!arenaOpen && phase !== 'celebration') return null;
  if (!arenaOpen && phase === 'celebration' && !result) return null;

  const share = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: RESONANCE_SHARE(cityName, result.desire.label, streak, result.mega),
        title: BRAND.name,
      });
    } catch {
      /* noop */
    }
  };

  const pct = Math.min(100, Math.round((progress / RESONANCE_GOAL) * 100));
  const rivalPct = Math.min(100, Math.round((rivalProgress / RESONANCE_GOAL) * 100));

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={[desire.color + '44', '#050508', '#0a0018']}
        style={StyleSheet.absoluteFill}
      />

      {phase === 'celebration' && result ? (
        <>
          <Text style={styles.megaTag}>{result.mega ? '⚡ MEGA RESONANCIA' : '🌍 RESONANCIA'}</Text>
          <Text style={[styles.title, { color: desire.color }]}>
            {desire.emoji} {cityName} resonó
          </Text>
          <Text style={styles.confession}>"{result.confession}"</Text>
          <Text style={styles.stats}>
            +{result.coins} monedas · {result.contributors} almas · racha {streak}
          </Text>
          {result.rivalBeat && (
            <Text style={styles.rivalLost}>{rivalName} llegó primero esta vez…</Text>
          )}
          <Pressable style={[styles.cta, { backgroundColor: desire.color }]} onPress={share}>
            <Text style={styles.ctaText}>COMPARTIR LA RESONANCIA</Text>
          </Pressable>
          <Pressable onPress={dismissCelebration} style={styles.ghost}>
            <Text style={styles.ghostText}>Continuar</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.souls}>{worldSouls.toLocaleString()} almas en el wire</Text>
          <Text style={styles.megaTag}>
            {mega ? '⚡ MEGA DESEO' : phase === 'whisper' ? '👁 SUSURRO' : '🌍 VENTANA ABIERTA'}
          </Text>
          <Text style={[styles.title, { color: desire.color }]}>
            {desire.emoji} {desire.label}
          </Text>
          <Text style={styles.whisper}>{lululaWhisper}</Text>
          <Text style={styles.timer}>{secLeft}s</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: desire.color }]} />
          </View>
          <Text style={styles.barLabel}>
            {cityName}: {progress}/{RESONANCE_GOAL} · tú +{personalContribution}
          </Text>

          <View style={styles.rivalRow}>
            <Text style={styles.rivalLabel}>{rivalName}</Text>
            <View style={styles.rivalTrack}>
              <View style={[styles.rivalFill, { width: `${rivalPct}%` }]} />
            </View>
            <Text style={styles.rivalPct}>{rivalPct}%</Text>
          </View>

          <Text style={styles.mantra}>Mantra: "{desire.mantra}"</Text>
          <Text style={styles.hint}>Escribe en IRC o usa /deseo [palabra] · 3× poder</Text>

          <View style={styles.quickRow}>
            <Pressable
              style={[styles.quickBtn, { borderColor: desire.color }]}
              onPress={() => submitDesire(`/deseo ${desire.keywords[0]}`)}>
              <Text style={styles.quickText}>/deseo {desire.keywords[0]}</Text>
            </Pressable>
            <Pressable
              style={[styles.quickBtn, { borderColor: desire.color }]}
              onPress={() => submitDesire(desire.mantra)}>
              <Text style={styles.quickText}>{desire.mantra}</Text>
            </Pressable>
          </View>

          <Pressable onPress={closeArena} style={styles.ghost}>
            <Text style={styles.ghostText}>Minimizar (sigue en el wire)</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  souls: { fontSize: 11, fontFamily: 'Courier', color: '#888' },
  megaTag: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#FFD700' },
  title: { fontSize: 28, fontFamily: 'Courier', fontWeight: 'bold', textAlign: 'center' },
  whisper: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
  timer: { fontSize: 36, fontFamily: 'Courier', fontWeight: 'bold', color: '#fff' },
  barTrack: {
    width: '100%',
    height: 14,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#444',
  },
  barFill: { height: '100%' },
  barLabel: { fontSize: 11, fontFamily: 'Courier', color: '#aaa' },
  rivalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  rivalLabel: { fontSize: 10, fontFamily: 'Courier', color: '#ff6600', width: 70 },
  rivalTrack: { flex: 1, height: 8, backgroundColor: '#331100' },
  rivalFill: { height: '100%', backgroundColor: '#ff6600' },
  rivalPct: { fontSize: 10, fontFamily: 'Courier', color: '#ff6600', width: 32 },
  mantra: { fontSize: 12, fontFamily: 'Courier', color: '#BF00FF' },
  hint: { fontSize: 10, fontFamily: 'Courier', color: '#666', textAlign: 'center' },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    backgroundColor: '#111',
  },
  quickText: { fontSize: 11, fontFamily: 'Courier', color: '#fff' },
  confession: {
    fontSize: 16,
    fontFamily: 'Courier',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  stats: { fontSize: 12, fontFamily: 'Courier', color: '#00E5FF' },
  rivalLost: { fontSize: 11, fontFamily: 'Courier', color: '#ff4466' },
  cta: { paddingHorizontal: 24, paddingVertical: 14, marginTop: 12 },
  ctaText: { fontSize: 13, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  ghost: { marginTop: 16, padding: 10 },
  ghostText: { fontSize: 11, fontFamily: 'Courier', color: '#666' },
});
