import { StyleSheet, Text, View } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  level: number;
  progress: number;
  xp: number;
};

export default function LevelBar({ level, progress, xp }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.level}>LVL {level}</Text>
        <Text style={styles.xp}>{xp} XP</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  level: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  xp: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  track: {
    height: 8,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: MircColors.borderDark,
  },
  fill: {
    height: '100%',
    backgroundColor: MircColors.neonPink,
  },
});
