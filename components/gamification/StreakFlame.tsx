import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  streak: number;
  size?: 'sm' | 'md';
};

export default function StreakFlame({ streak, size = 'md' }: Props) {
  const big = size === 'md';

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={
          streak >= 7
            ? [MircColors.neonPink, '#FF6600', MircColors.neonCyan]
            : streak >= 3
              ? ['#FF6600', MircColors.neonPink]
              : ['#444', '#666']
        }
        style={[styles.flame, big ? styles.flameMd : styles.flameSm]}>
        <Text style={[styles.emoji, big && styles.emojiMd]}>🔥</Text>
      </LinearGradient>
      <Text style={[styles.count, big && styles.countMd]}>{streak}</Text>
      <Text style={styles.label}>días</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
  },
  flame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MircColors.borderDark,
  },
  flameMd: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  flameSm: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  emoji: {
    fontSize: 20,
  },
  emojiMd: {
    fontSize: 28,
  },
  count: {
    fontSize: 18,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  countMd: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
});
