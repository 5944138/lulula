import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/config';
import { fechaLabelMX } from '@/constants/preguntas';
import { CIUDAD, type SenalResult, buildShareText } from '@/constants/senal';
import { MircColors } from '@/constants/theme';

type Props = {
  result: SenalResult;
  yourWord: string | null;
  yourWordCount: number;
};

export function rareNote(yourWord: string | null, yourWordCount: number, winner: string): string | null {
  if (!yourWord || yourWordCount === 0) return null;
  const norm = yourWord.toLowerCase();
  if (norm === winner.toLowerCase()) return null;
  if (yourWordCount <= 3) {
    const otros = yourWordCount - 1;
    if (otros <= 0) return `Tú fuiste la ÚNICA persona que dijo "${yourWord}".`;
    return `Tú y solo ${otros} persona${otros === 1 ? '' : 's'} más dijeron "${yourWord}".`;
  }
  return null;
}

export function shareTextFor(result: SenalResult, yourWord: string | null, yourWordCount: number) {
  return buildShareText(result, yourWord, rareNote(yourWord, yourWordCount, result.winningWord));
}

/** Tarjeta visual para reveal + compartir */
export default function TarjetaSenal({ result, yourWord, yourWordCount }: Props) {
  const nota = rareNote(yourWord, yourWordCount, result.winningWord);
  const fecha = result.fecha
    ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(result.fecha + 'T12:00:00'),
      )
    : fechaLabelMX();

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#2a1040', '#0a1628', '#0a2018']} style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/lulula-mascot.png')}
            style={styles.mascot}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.brand}>La Señal</Text>
            <Text style={styles.meta}>
              {CIUDAD} · {fecha}
            </Text>
          </View>
        </View>

        <Text style={styles.question}>"{result.question}"</Text>

        <Text style={styles.cityLine}>{CIUDAD} dijo</Text>
        <Text style={styles.winner}>{result.winningWord.toUpperCase()}</Text>
        <Text style={styles.count}>
          {result.winningCount} {result.winningCount === 1 ? 'persona' : 'personas'} ·{' '}
          {result.totalPlayers} participaron
        </Text>

        <View style={styles.divider} />

        <Text style={styles.yours}>Tú dijiste: {yourWord ?? '—'}</Text>
        {nota ? <Text style={styles.nota}>{nota}</Text> : null}

        <Text style={styles.footer}>¿Tú qué hubieras dicho? · {BRAND.tagline}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  card: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: MircColors.neonPink,
    padding: 24,
    gap: 12,
    shadowColor: MircColors.neonCyan,
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mascot: { width: 48, height: 48, borderRadius: 8 },
  brand: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
    letterSpacing: 2,
  },
  meta: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textMuted },
  question: {
    fontSize: 16,
    fontFamily: 'Courier',
    color: '#e8e8e8',
    lineHeight: 24,
    fontStyle: 'italic',
    marginTop: 8,
  },
  cityLine: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    marginTop: 12,
    letterSpacing: 1,
  },
  winner: {
    fontSize: 52,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonGreen,
    letterSpacing: 6,
    textAlign: 'center',
  },
  count: { fontSize: 12, fontFamily: 'Courier', color: '#888', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 8 },
  yours: { fontSize: 15, fontFamily: 'Courier', color: '#fff', textAlign: 'center' },
  nota: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.neonPink,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
});
