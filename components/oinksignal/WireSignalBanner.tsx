import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useOinkSignal } from '@/context/OinkSignalContext';

/** Banner global cuando LA SEÑAL está activa */
export default function WireSignalBanner() {
  const { phase, secLeft, leadingWord, openDrop } = useOinkSignal();

  if (phase !== 'countdown' && phase !== 'live') return null;

  return (
    <Pressable style={styles.bar} onPress={openDrop}>
      <Text style={styles.icon}>📡</Text>
      <View style={styles.mid}>
        <Text style={styles.title}>
          {phase === 'countdown' ? 'SEÑAL OINK INCOMING' : 'SEÑAL OINK — EN VIVO'}
        </Text>
        <Text style={styles.sub}>
          {phase === 'live' ? `Lidera: ${leadingWord} · ${secLeft}s` : `${secLeft}s · prepárate`}
        </Text>
      </View>
      <Text style={styles.cta}>ENTRAR</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0d2818',
    borderBottomWidth: 2,
    borderBottomColor: '#25D366',
    gap: 10,
  },
  icon: { fontSize: 20 },
  mid: { flex: 1 },
  title: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#25D366' },
  sub: { fontSize: 10, fontFamily: 'Courier', color: '#8fbc8f' },
  cta: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#FFD700' },
});
