import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BRAND } from '@/constants/config';
import { SIGNAL_SHARE, WIRE_MANIFESTO } from '@/constants/oinkSignal';
import { useOinkSignal } from '@/context/OinkSignalContext';

/** THE DROP — fullscreen. 60 segundos. Una palabra. Todo el planeta. */
export default function SignalDrop() {
  const {
    phase,
    question,
    secLeft,
    leadingWord,
    yourWord,
    result,
    dropOpen,
    closeDrop,
    dismissReveal,
    submitWord,
    cityName,
  } = useOinkSignal();

  if (!dropOpen && phase === 'dormant') return null;
  if (!dropOpen && phase !== 'reveal') return null;
  if (!dropOpen && !result) return null;

  const share = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: SIGNAL_SHARE(result.globalWord, result.globalCity, result.won),
        title: BRAND.name,
      });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient colors={['#0a0018', '#000', '#001a0a']} style={StyleSheet.absoluteFill} />

      {phase === 'reveal' && result ? (
        <>
          <Text style={styles.eyebrow}>{result.won ? '🏆 TU CIUDAD GANÓ' : '📡 SEÑAL RECIBIDA'}</Text>
          <Text style={styles.word}>{result.globalWord.toUpperCase()}</Text>
          <Text style={styles.meta}>
            {result.globalCity} · {result.globalVotes.toLocaleString()} almas
          </Text>
          <Text style={styles.cityLine}>
            {cityName} votó: "{result.cityWord}" ({result.cityVotes} votos)
          </Text>
          <Text style={styles.quote}>"{result.question.prompt}"</Text>
          <Pressable style={styles.cta} onPress={share}>
            <Text style={styles.ctaText}>COMPARTIR LA SEÑAL</Text>
          </Pressable>
          <Pressable onPress={dismissReveal} style={styles.ghost}>
            <Text style={styles.ghostText}>Continuar</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.eyebrow}>
            {phase === 'countdown' ? '⏳ LA SEÑAL LLEGA' : '📡 SEÑAL OINK — EN VIVO'}
          </Text>
          <Text style={styles.emoji}>{question.emoji}</Text>
          <Text style={styles.prompt}>{question.prompt}</Text>
          <Text style={styles.timer}>{secLeft}s</Text>

          {phase === 'live' && (
            <>
              <Text style={styles.lead}>
                Tu ciudad lidera: <Text style={styles.leadWord}>{leadingWord}</Text>
                {yourWord ? ` · tú: ${yourWord}` : ''}
              </Text>
              <Text style={styles.hint}>{question.hint}</Text>
              <View style={styles.quickRow}>
                {['oink', 'fuego', 'amor', 'libre', 'caos'].map((w) => (
                  <Pressable key={w} style={styles.chip} onPress={() => submitWord(w)}>
                    <Text style={styles.chipText}>{w}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {phase === 'countdown' && (
            <Text style={styles.countdownHint}>Prepárate. Una palabra. Tu ciudad contra el mundo.</Text>
          )}

          <Text style={styles.manifesto}>{WIRE_MANIFESTO}</Text>

          {phase !== 'reveal' && (
            <Pressable onPress={closeDrop} style={styles.ghost}>
              <Text style={styles.ghostText}>Minimizar</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
  },
  emoji: { fontSize: 56 },
  prompt: {
    fontSize: 20,
    fontFamily: 'Courier',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
  },
  timer: { fontSize: 56, fontFamily: 'Courier', fontWeight: 'bold', color: '#25D366' },
  lead: { fontSize: 13, fontFamily: 'Courier', color: '#aaa', textAlign: 'center' },
  leadWord: { color: '#25D366', fontWeight: 'bold' },
  hint: { fontSize: 11, fontFamily: 'Courier', color: '#666', textAlign: 'center' },
  countdownHint: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#8696A0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  manifesto: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#444',
    textAlign: 'center',
    marginTop: 12,
  },
  word: {
    fontSize: 48,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#25D366',
    letterSpacing: 4,
  },
  meta: { fontSize: 14, fontFamily: 'Courier', color: '#00E5FF' },
  cityLine: { fontSize: 12, fontFamily: 'Courier', color: '#888' },
  quote: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#25D366',
    backgroundColor: '#0a2018',
  },
  chipText: { fontSize: 12, fontFamily: 'Courier', color: '#25D366' },
  cta: {
    backgroundColor: '#25D366',
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginTop: 12,
  },
  ctaText: { fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  ghost: { padding: 12, marginTop: 8 },
  ghostText: { fontSize: 11, fontFamily: 'Courier', color: '#555' },
});
