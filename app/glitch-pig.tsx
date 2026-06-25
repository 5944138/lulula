import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BANISH_SEQUENCE } from '@/constants/glitchPig';
import { useGlitchPig } from '@/context/GlitchPigContext';
import { WA } from '@/constants/whatsappTheme';

/** Pantalla del Oráculo + info del Cerdo Glitch */
export default function GlitchPigScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { oracle, banishesTotal, phase, progress, openArena, spawnLine } = useGlitchPig();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>CERDO GLITCH</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.oracleBox}>
          <Text style={styles.oracleLabel}>🔮 OINK ORACLE</Text>
          <Text style={styles.oracleText}>{oracle}</Text>
          <Text style={styles.oracleHint}>Generado del caos de tu sala IRC</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿QUÉ ES ESTO?</Text>
          <Text style={styles.infoLine}>
            Cada ~25 min un cerdo corrupto invade el wire de tu ciudad.
          </Text>
          <Text style={styles.infoLine}>
            Solo la cooperación salva: escriban en IRC, en orden:
          </Text>
          <Text style={styles.sequence}>{BANISH_SEQUENCE.join(' → ')}</Text>
          <Text style={styles.infoLine}>
            Cada letra puede ser de una persona distinta. 3 minutos. O el caos gana.
          </Text>
        </View>

        {phase === 'invaded' && (
          <Pressable style={styles.fightBtn} onPress={openArena}>
            <Text style={styles.fightText}>👾 ¡GLITCH ACTIVO! ENTRAR</Text>
            <Text style={styles.fightSub}>{spawnLine}</Text>
            <Text style={styles.fightProg}>Progreso: {progress}/{BANISH_SEQUENCE.length}</Text>
          </Pressable>
        )}

        <Text style={styles.stats}>Ciudades salvadas: {banishesTotal}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0008' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  back: { fontSize: 28, color: WA.text },
  title: { fontSize: 16, fontWeight: '900', color: '#FF0044', letterSpacing: 3 },
  scroll: { padding: 16, gap: 16 },
  oracleBox: {
    backgroundColor: '#1a0a20',
    borderWidth: 2,
    borderColor: '#BF00FF',
    padding: 16,
    gap: 8,
  },
  oracleLabel: { fontSize: 11, fontWeight: '800', color: '#BF00FF', letterSpacing: 2 },
  oracleText: { fontSize: 16, color: WA.text, lineHeight: 24, fontStyle: 'italic' },
  oracleHint: { fontSize: 10, color: WA.textSecondary },
  infoBox: { backgroundColor: '#111', padding: 16, gap: 8, borderLeftWidth: 4, borderLeftColor: '#FF0044' },
  infoTitle: { fontSize: 12, fontWeight: '800', color: '#FF0044' },
  infoLine: { fontSize: 13, color: WA.textSecondary, lineHeight: 20 },
  sequence: {
    fontFamily: 'Courier',
    fontSize: 22,
    fontWeight: '900',
    color: '#00FF88',
    textAlign: 'center',
    marginVertical: 8,
  },
  fightBtn: {
    backgroundColor: '#FF004422',
    borderWidth: 2,
    borderColor: '#FF0044',
    padding: 16,
    gap: 6,
  },
  fightText: { fontSize: 16, fontWeight: '900', color: '#FF0044' },
  fightSub: { fontFamily: 'Courier', fontSize: 11, color: '#00FF88' },
  fightProg: { fontSize: 12, color: WA.text },
  stats: { fontSize: 11, color: WA.textSecondary, textAlign: 'center' },
});
