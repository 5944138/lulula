import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import CollectiveMindBanner from '@/components/collectivemind/CollectiveMindBanner';
import MircWindow from '@/components/mirc/MircWindow';
import { BRAND } from '@/constants/config';
import { DESIRES, RESONANCE_GOAL, RESONANCE_SHARE } from '@/constants/collectiveMind';
import { MircColors } from '@/constants/theme';
import { useCollectiveMind } from '@/context/CollectiveMindContext';

export default function CollectiveMindScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    resonancesTotal,
    personalContribution,
    lululaWhisper,
    confessionWall,
    openArena,
    submitDesire,
    cityName,
  } = useCollectiveMind();

  const share = async () => {
    try {
      await Share.share({
        message: RESONANCE_SHARE(cityName, desire.label, streak, mega),
        title: BRAND.name,
      });
    } catch {
      /* noop */
    }
  };

  const pct = Math.min(100, Math.round((progress / RESONANCE_GOAL) * 100));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0a0018', '#050508']} style={StyleSheet.absoluteFill} />
      <MircWindow title="MENTE COLECTIVA — Deseos del Wire" style={styles.window}>
        <CollectiveMindBanner onPress={openArena} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.souls}>{worldSouls.toLocaleString()} almas conectadas ahora</Text>

          <View style={[styles.hero, { borderColor: desire.color }]}>
            <Text style={styles.phaseBadge}>
              {phase === 'idle'
                ? '💤 ENTRE CICLOS'
                : phase === 'whisper'
                  ? '👁 SUSURRO MUNDIAL'
                  : phase === 'active'
                    ? '🔴 RESONANDO'
                    : '🎉 CELEBRACIÓN'}
            </Text>
            <Text style={[styles.heroEmoji]}>{desire.emoji}</Text>
            <Text style={[styles.heroTitle, { color: desire.color }]}>{desire.label}</Text>
            {mega && <Text style={styles.mega}>⚡ MEGA DESEO — recompensas x2</Text>}
            <Text style={styles.whisper}>{lululaWhisper}</Text>
            {phase !== 'idle' && (
              <Text style={styles.timer}>{secLeft}s restantes</Text>
            )}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: desire.color }]} />
            </View>
            <Text style={styles.barMeta}>
              {cityName}: {progress}/{RESONANCE_GOAL} · tú +{personalContribution}
            </Text>
            <Text style={styles.rival}>
              vs {rivalName}: {rivalProgress}/{RESONANCE_GOAL}
            </Text>
          </View>

          <Pressable style={styles.enterBtn} onPress={openArena}>
            <Text style={styles.enterText}>
              {phase === 'idle' ? 'VER PRÓXIMA RESONANCIA' : 'ENTRAR A LA RESONANCIA'}
            </Text>
          </Pressable>

          <Text style={styles.section}>Mantra colectivo</Text>
          <Pressable
            style={[styles.mantraBtn, { borderColor: desire.color }]}
            onPress={() => submitDesire(desire.mantra)}>
            <Text style={styles.mantraText}>"{desire.mantra}"</Text>
            <Text style={styles.mantraHint}>Tap para enviar al IRC</Text>
          </Pressable>

          <Text style={styles.section}>Los 6 deseos del planeta</Text>
          {DESIRES.map((d) => (
            <View key={d.id} style={[styles.desireRow, d.id === desire.id && styles.desireActive]}>
              <Text style={styles.desireEmoji}>{d.emoji}</Text>
              <View style={styles.desireMid}>
                <Text style={[styles.desireLabel, { color: d.color }]}>{d.label}</Text>
                <Text style={styles.desireWhisper}>{d.whisper}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.section}>Muro de confesiones</Text>
          {confessionWall.length === 0 ? (
            <Text style={styles.empty}>Aún no hay confesiones. Gana una resonancia.</Text>
          ) : (
            confessionWall.map((c, i) => (
              <Text key={i} style={styles.confession}>
                "{c}"
              </Text>
            ))
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{streak}</Text>
              <Text style={styles.statLabel}>racha</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{resonancesTotal}</Text>
              <Text style={styles.statLabel}>resonancias</Text>
            </View>
          </View>

          <Pressable style={styles.shareBtn} onPress={share}>
            <Text style={styles.shareText}>INVITAR AL COLECTIVO</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Volver</Text>
          </Pressable>
        </ScrollView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  window: { flex: 1, margin: 8 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  souls: { fontSize: 11, fontFamily: 'Courier', color: '#666', textAlign: 'center' },
  hero: {
    padding: 20,
    borderWidth: 3,
    backgroundColor: '#0a0a14',
    alignItems: 'center',
    gap: 8,
  },
  phaseBadge: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#BF00FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: 26, fontFamily: 'Courier', fontWeight: 'bold' },
  mega: { fontSize: 11, fontFamily: 'Courier', color: '#FFD700', fontWeight: 'bold' },
  whisper: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  timer: { fontSize: 24, fontFamily: 'Courier', fontWeight: 'bold', color: '#fff' },
  barTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#222',
    marginTop: 8,
  },
  barFill: { height: '100%' },
  barMeta: { fontSize: 10, fontFamily: 'Courier', color: '#aaa' },
  rival: { fontSize: 10, fontFamily: 'Courier', color: '#ff6600' },
  enterBtn: {
    backgroundColor: '#BF00FF',
    padding: 16,
    alignItems: 'center',
  },
  enterText: { fontSize: 13, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  section: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
    marginTop: 8,
  },
  mantraBtn: {
    padding: 16,
    borderWidth: 2,
    backgroundColor: '#111',
    alignItems: 'center',
    gap: 4,
  },
  mantraText: { fontSize: 18, fontFamily: 'Courier', color: '#fff', fontStyle: 'italic' },
  mantraHint: { fontSize: 9, fontFamily: 'Courier', color: '#666' },
  desireRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  desireActive: { borderColor: '#BF00FF', backgroundColor: '#1a0a20' },
  desireEmoji: { fontSize: 28 },
  desireMid: { flex: 1, gap: 4 },
  desireLabel: { fontSize: 12, fontFamily: 'Courier', fontWeight: 'bold' },
  desireWhisper: { fontSize: 10, fontFamily: 'Courier', color: '#888', lineHeight: 15 },
  confession: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textLight,
    fontStyle: 'italic',
    lineHeight: 18,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  empty: { fontSize: 11, fontFamily: 'Courier', color: '#555' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#333',
  },
  statNum: { fontSize: 32, fontFamily: 'Courier', fontWeight: 'bold', color: '#00E5FF' },
  statLabel: { fontSize: 10, fontFamily: 'Courier', color: '#888' },
  shareBtn: {
    padding: 14,
    borderWidth: 2,
    borderColor: '#00E5FF',
    alignItems: 'center',
  },
  shareText: { fontSize: 11, fontFamily: 'Courier', color: '#00E5FF', fontWeight: 'bold' },
  back: { alignItems: 'center', padding: 12 },
  backText: { fontSize: 12, fontFamily: 'Courier', color: '#666' },
});
