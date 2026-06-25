import { StyleSheet, Text, View } from 'react-native';

import { WIRE_LEGENDS } from '@/constants/wireLegends';
import { MircColors } from '@/constants/theme';

type Props = {
  messagesToday: number;
  unlockedCount: number;
  chapterTitle?: string;
};

export default function LegendTerminal({ messagesToday, unlockedCount, chapterTitle }: Props) {
  const next = WIRE_LEGENDS.find((c) => messagesToday < c.threshold);
  const progress = next ? Math.min(100, Math.round((messagesToday / next.threshold) * 100)) : 100;

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{'>'} WIRE LEGENDS v1.0 — BBS MODE</Text>
      <Text style={styles.prompt}>{'>'} mensajes ciudad hoy: {messagesToday}</Text>
      <Text style={styles.prompt}>{'>'} capítulos: {unlockedCount}/{WIRE_LEGENDS.length}</Text>
      {chapterTitle ? <Text style={styles.chapter}>{'>'} ACTIVO: {chapterTitle}</Text> : null}
      {next ? (
        <>
          <Text style={styles.next}>{'>'} siguiente: &quot;{next.title}&quot; ({next.threshold} msgs)</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>
        </>
      ) : (
        <Text style={styles.done}>{'>'} TODOS LOS CAPÍTULOS DESBLOQUEADOS ✓</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: MircColors.neonGreen,
    padding: 12,
    gap: 4,
  },
  prompt: { fontFamily: 'Courier', fontSize: 11, color: MircColors.neonGreen },
  chapter: { fontFamily: 'Courier', fontSize: 12, color: MircColors.neonCyan, fontWeight: 'bold' },
  next: { fontFamily: 'Courier', fontSize: 11, color: MircColors.textMuted, marginTop: 6 },
  barBg: { height: 6, backgroundColor: '#1a1a1a', marginTop: 4 },
  barFill: { height: 6, backgroundColor: MircColors.neonGreen },
  done: { fontFamily: 'Courier', fontSize: 11, color: MircColors.neonPink, marginTop: 6 },
});
