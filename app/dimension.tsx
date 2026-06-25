import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

import CollectiveCanvas from '@/components/dimension/CollectiveCanvas';
import LegendTerminal from '@/components/dimension/LegendTerminal';
import { BRAND } from '@/constants/config';
import { DIMENSION_SHARE } from '@/constants/oinkDimension';
import { WIRE_LEGENDS } from '@/constants/wireLegends';
import { MircColors } from '@/constants/theme';
import { useOinkDimension } from '@/context/OinkDimensionContext';
import { useIdentity } from '@/context/IdentityContext';
import { WA } from '@/constants/whatsappTheme';

/** La Dimensión Oink — el chat pinta un universo paralelo */
export default function DimensionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityName, tribeEmoji, tribeName } = useIdentity();
  const {
    grid,
    filled,
    cityMessagesToday,
    unlockedChapters,
    activeChapter,
    possession,
    banishPossession,
  } = useOinkDimension();

  const [expandedChapter, setExpandedChapter] = useState<number | null>(
    unlockedChapters[unlockedChapters.length - 1]?.id ?? null,
  );

  const share = async () => {
    const msg = DIMENSION_SHARE(cityName, filled, activeChapter?.title ?? '???');
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0a0015', '#1a0520', '#000']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.dimLabel}>DIMENSIÓN OINK</Text>
          <Text style={styles.city}>{cityName} {tribeEmoji}</Text>
        </View>
        <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.mascot} />
      </View>

      {possession.active && (
        <Pressable style={styles.possession} onPress={banishPossession}>
          <Text style={styles.possessionTitle}>👁 LULULA TE POSEE</Text>
          <Text style={styles.possessionLine}>{possession.line}</Text>
          <Text style={styles.possessionCta}>
            TAP para banish 🐷 → IRC (+15 🪙) · {possession.secLeft}s
          </Text>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hook}>
          Cada mensaje en tu sala IRC pinta este canvas.{'\n'}
          <Text style={styles.hookAccent}>No existe en ninguna otra app.</Text>
        </Text>

        <CollectiveCanvas grid={grid} />
        <Text style={styles.canvasMeta}>
          {filled} celdas pintadas · {cityMessagesToday} msgs hoy · {tribeName}
        </Text>

        <LegendTerminal
          messagesToday={cityMessagesToday}
          unlockedCount={unlockedChapters.length}
          chapterTitle={activeChapter?.title}
        />

        {WIRE_LEGENDS.map((ch) => {
          const unlocked = unlockedChapters.some((u) => u.id === ch.id);
          const open = expandedChapter === ch.id;
          if (!unlocked && cityMessagesToday < ch.threshold) {
            return (
              <View key={ch.id} style={styles.lockedChapter}>
                <Text style={styles.lockedText}>🔒 {ch.title} — {ch.threshold} msgs</Text>
              </View>
            );
          }
          if (!unlocked) return null;
          return (
            <Pressable
              key={ch.id}
              style={styles.chapterCard}
              onPress={() => setExpandedChapter(open ? null : ch.id)}>
              <Text style={styles.chapterTitle}>📜 {ch.title}</Text>
              <Text style={styles.chapterSub}>{ch.subtitle}</Text>
              {open &&
                ch.lines.map((line, i) => (
                  <Text key={i} style={styles.chapterLine}>
                    {line}
                  </Text>
                ))}
              <Text style={styles.chapterReward}>{ch.reward}</Text>
            </Pressable>
          );
        })}

        <Pressable style={styles.shareBtn} onPress={share}>
          <LinearGradient colors={['#FF00AA', '#BF00FF']} style={styles.shareGrad}>
            <Text style={styles.shareText}>📣 Compartir la Dimensión</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.footer}>
          WhatsApp es la puerta. mIRC es el wire.{'\n'}La Dimensión es lo que queda cuando miras demasiado tiempo.
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  back: { fontSize: 28, color: WA.text },
  headerMid: { flex: 1 },
  dimLabel: { fontSize: 10, fontWeight: '800', color: '#FF00AA', letterSpacing: 3 },
  city: { fontSize: 18, fontWeight: '700', color: WA.text },
  mascot: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: '#FF00AA' },
  possession: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#FF00AA33',
    borderWidth: 2,
    borderColor: '#FF00AA',
    gap: 6,
  },
  possessionTitle: { fontSize: 14, fontWeight: '900', color: '#FF00AA' },
  possessionLine: { fontSize: 13, color: WA.text, fontStyle: 'italic' },
  possessionCta: { fontSize: 11, color: WA.teal },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  hook: { fontSize: 14, color: WA.textSecondary, textAlign: 'center', lineHeight: 22 },
  hookAccent: { color: WA.teal, fontWeight: '700' },
  canvasMeta: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: WA.textSecondary,
    textAlign: 'center',
  },
  lockedChapter: {
    padding: 10,
    backgroundColor: WA.inputBg,
    opacity: 0.6,
  },
  lockedText: { fontFamily: 'Courier', fontSize: 11, color: WA.textSecondary },
  chapterCard: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#00FFFF44',
    padding: 12,
    gap: 6,
  },
  chapterTitle: { fontFamily: 'Courier', fontSize: 14, fontWeight: 'bold', color: '#00FFFF' },
  chapterSub: { fontFamily: 'Courier', fontSize: 11, color: WA.textSecondary },
  chapterLine: { fontFamily: 'Courier', fontSize: 11, color: MircColors.neonGreen, lineHeight: 18 },
  chapterReward: { fontFamily: 'Courier', fontSize: 10, color: MircColors.neonPink, marginTop: 4 },
  shareBtn: { borderRadius: 28, overflow: 'hidden', marginTop: 8 },
  shareGrad: { paddingVertical: 16, alignItems: 'center' },
  shareText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  footer: {
    fontSize: 12,
    color: WA.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
