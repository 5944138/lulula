import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BANISH_SEQUENCE, GLITCH_SHARE } from '@/constants/glitchPig';
import { BRAND } from '@/constants/config';
import { useGlitchPig } from '@/context/GlitchPigContext';

/** Overlay ARG — la ciudad debe escribir L-U-L-U-L-A en el IRC */
export default function GlitchPigArena() {
  const {
    phase,
    secLeft,
    progress,
    spawnLine,
    taunt,
    helpers,
    arenaOpen,
    closeArena,
    contributeLetter,
    cityName,
    sequence,
  } = useGlitchPig();

  if (!arenaOpen || phase === 'dormant') return null;

  const share = async () => {
    const msg = GLITCH_SHARE(cityName, helpers.length, BANISH_SEQUENCE.length * 10);
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient colors={['#1a0000', '#000', '#0a001a']} style={StyleSheet.absoluteFill} />

      {phase === 'invaded' && (
        <>
          <Text style={styles.alert}>👾 CERDO GLITCH INVADIÓ {cityName.toUpperCase()}</Text>
          <Text style={styles.spawn}>{spawnLine}</Text>
          <Text style={styles.taunt}>{taunt}</Text>
          <Text style={styles.timer}>{secLeft}s o el wire se corrompe</Text>

          <View style={styles.seqRow}>
            {sequence.map((ch, i) => (
              <View key={ch + i} style={[styles.seqCell, i < progress && styles.seqDone]}>
                <Text style={styles.seqChar}>{i < progress ? ch : '?'}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.hint}>
            Escribe cada letra en tu sala IRC — en orden — con tu ciudad
          </Text>

          <View style={styles.btnRow}>
            {sequence.map((ch, i) => (
              <Pressable
                key={`btn-${ch}-${i}`}
                style={[styles.letterBtn, i < progress && styles.letterDone]}
                onPress={() => contributeLetter(ch)}
                disabled={i !== progress}>
                <Text style={styles.letterText}>{ch}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helpers}>
            {helpers.length > 0 ? `Héroes: ${helpers.join(', ')}` : 'Esperando héroes...'}
          </Text>

          <Pressable onPress={closeArena} style={styles.ghost}>
            <Text style={styles.ghostText}>Minimizar (sigue activo)</Text>
          </Pressable>
        </>
      )}

      {phase === 'banished' && (
        <View style={styles.win}>
          <Text style={styles.winEmoji}>✨👾✨</Text>
          <Text style={styles.winTitle}>GLITCH BANEADO</Text>
          <Text style={styles.winSub}>{cityName} salvó el wire</Text>
          <Pressable style={styles.shareBtn} onPress={share}>
            <Text style={styles.shareText}>📣 Compartir victoria</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 250,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  alert: { fontSize: 14, fontWeight: '900', color: '#FF0044', letterSpacing: 1, textAlign: 'center' },
  spawn: { fontFamily: 'Courier', fontSize: 12, color: '#00FF88', textAlign: 'center' },
  taunt: { fontSize: 16, color: '#fff', fontStyle: 'italic', textAlign: 'center' },
  timer: { fontSize: 28, fontWeight: '900', color: '#FF0044' },
  seqRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  seqCell: {
    width: 40,
    height: 48,
    borderWidth: 2,
    borderColor: '#FF0044',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  seqDone: { borderColor: '#00FF88', backgroundColor: '#00FF8822' },
  seqChar: { fontSize: 20, fontWeight: '900', color: '#fff' },
  hint: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  letterBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FF0044',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterDone: { backgroundColor: '#333', opacity: 0.5 },
  letterText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  helpers: { fontFamily: 'Courier', fontSize: 11, color: '#00FF88' },
  ghost: { marginTop: 8 },
  ghostText: { fontSize: 12, color: '#666' },
  win: { alignItems: 'center', gap: 12 },
  winEmoji: { fontSize: 48 },
  winTitle: { fontSize: 28, fontWeight: '900', color: '#00FF88' },
  winSub: { fontSize: 16, color: '#fff' },
  shareBtn: { backgroundColor: '#FF0044', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24 },
  shareText: { fontWeight: '800', color: '#fff' },
});
