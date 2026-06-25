import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RESONANCE_GOAL } from '@/constants/collectiveMind';
import { useCollectiveMind } from '@/context/CollectiveMindContext';

type Props = {
  onPress?: () => void;
};

/** Barra compacta — pulso del deseo mundial */
export default function CollectiveMindBanner({ onPress }: Props) {
  const { phase, desire, progress, secLeft, mega, lululaWhisper, openArena } = useCollectiveMind();

  if (phase === 'idle') return null;

  const pct = Math.min(100, Math.round((progress / RESONANCE_GOAL) * 100));
  const live = phase === 'active' || phase === 'whisper';

  return (
    <Pressable
      style={[styles.bar, live && { borderColor: desire.color }]}
      onPress={onPress ?? openArena}>
      <Text style={styles.emoji}>{desire.emoji}</Text>
      <View style={styles.mid}>
        <Text style={[styles.label, { color: desire.color }]}>
          {mega ? '⚡ ' : ''}MENTE COLECTIVA · {desire.label}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: desire.color }]} />
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {live ? `${secLeft}s · ${pct}%` : lululaWhisper}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0a0a12',
    borderBottomWidth: 2,
    borderColor: '#333',
    gap: 10,
  },
  emoji: { fontSize: 22 },
  mid: { flex: 1, gap: 3 },
  label: { fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold' },
  track: { height: 6, backgroundColor: '#222', borderRadius: 1 },
  fill: { height: '100%', borderRadius: 1 },
  sub: { fontSize: 9, fontFamily: 'Courier', color: '#888' },
  chevron: { fontSize: 20, color: '#666' },
});
