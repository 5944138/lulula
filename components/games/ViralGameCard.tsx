import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViralGame } from '@/constants/games/catalog';
import { MircColors } from '@/constants/theme';
import { useEconomy } from '@/context/EconomyContext';

type Props = {
  game: ViralGame;
  onPress?: () => void;
};

export default function ViralGameCard({ game, onPress }: Props) {
  const { hasGamePass } = useEconomy();
  const live = game.status === 'live' || game.status === 'beta';
  const vip = hasGamePass(game.id);

  return (
    <Pressable
      style={[styles.card, { borderColor: game.accent + 'AA' }, live && styles.cardLive]}
      onPress={onPress}
      disabled={!live || !onPress}>
      <View style={styles.left}>
        <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.mascot} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{game.emoji}</Text>
          <Text style={styles.title}>{game.title}</Text>
          <View style={[styles.badge, live ? styles.badgeLive : styles.badgeSoon]}>
            <Text style={styles.badgeText}>{game.status === 'beta' ? 'BETA' : live ? 'JUGAR' : 'SOON'}</Text>
          </View>
        </View>
        <Text style={styles.inspired}>Como {game.inspiredBy}</Text>
        <Text style={styles.sub}>{game.subtitle}</Text>
        <Text style={styles.lolaLine}>"{game.lolaLine}"</Text>
        <View style={styles.metaRow}>
          <Text style={styles.xp}>+{game.coinReward} 🪙 · +{game.xpReward} XP</Text>
          {vip && <Text style={styles.vip}>PASS ✨</Text>}
        </View>
        <View style={styles.hooks}>
          {game.hooks.slice(0, 3).map((h) => (
            <Text key={h} style={styles.hookTag}>{h}</Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: MircColors.cardDark,
    borderWidth: 2,
  },
  cardLive: { backgroundColor: '#ffffff06' },
  left: { width: 72, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 64, height: 64, borderRadius: 14, borderWidth: 2, borderColor: '#FF00AA' },
  body: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emoji: { fontSize: 16 },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  badge: { paddingHorizontal: 6, paddingVertical: 2 },
  badgeLive: { backgroundColor: MircColors.neonGreen },
  badgeSoon: { backgroundColor: MircColors.textMuted },
  badgeText: { fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  inspired: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.neonPink,
    fontWeight: 'bold',
  },
  sub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 15 },
  lolaLine: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    fontStyle: 'italic',
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  xp: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonCyan },
  vip: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonGreen, fontWeight: 'bold' },
  hooks: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  hookTag: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#000',
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
