import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TarjetaSenal, { shareTextFor } from '@/components/senal/TarjetaSenal';
import LululaLogo from '@/components/brand/LululaLogo';
import { BRAND } from '@/constants/config';
import { CIUDAD } from '@/constants/senal';
import { MircColors } from '@/constants/theme';
import { useSignal } from '@/context/OinkSignalContext';

function pad(n: number) {
  return Math.max(0, n).toString().padStart(2, '0');
}

function formatHMS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function SenalScreen() {
  const insets = useSafeAreaInsets();
  const {
    nick,
    nickReady,
    connected,
    phase,
    secondsToSignal,
    secondsLeft,
    livePlayers,
    question,
    yourWord,
    yourWordCount,
    winningWord,
    winningCount,
    totalPlayers,
    topWords,
    yesterday,
    today,
    testMode,
    error,
    setNick,
    submitWord,
  } = useSignal();

  const [nickInput, setNickInput] = useState('');
  const [wordInput, setWordInput] = useState('');

  const activeResult =
    phase === 'resultado' && today
      ? today
      : phase === 'reveal' && winningWord
        ? {
            question,
            fecha: '',
            winningWord,
            winningCount,
            topWords,
            totalPlayers,
          }
        : null;

  const onShare = async () => {
    if (!activeResult) return;
    const msg = shareTextFor(activeResult, yourWord, yourWordCount);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'La Señal · Minatitlán', text: msg });
      } else {
        await Share.share({ message: msg, title: 'La Señal' });
      }
    } catch {
      await Clipboard.setStringAsync(msg);
    }
  };

  if (!nickReady) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 48, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#1a0033', '#050508', '#001a10']} style={StyleSheet.absoluteFill} />
        <LululaLogo size="lg" showTagline />
        <Text style={styles.welcome}>La Señal · {CIUDAD}</Text>
        <Text style={styles.nickHint}>Cada noche a las {BRAND.signalHour}. Una pregunta. Una palabra.</Text>
        <Text style={styles.nickLabel}>¿Cómo te llamas?</Text>
        <TextInput
          style={styles.nickInput}
          value={nickInput}
          onChangeText={setNickInput}
          placeholder="tu nombre"
          placeholderTextColor="#555"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={24}
          onSubmitEditing={() => setNick(nickInput)}
        />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Pressable style={styles.cta} onPress={() => setNick(nickInput)}>
          <Text style={styles.ctaText}>ENTRAR</Text>
        </Pressable>
      </View>
    );
  }

  const showCard = phase === 'reveal' || phase === 'resultado';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1a0033', '#050508', '#001a10']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LululaLogo size="sm" />
        <Text style={styles.hello}>
          Hola, {nick} · {connected ? '🟢 en línea' : 'conectando…'}
          {testMode ? ' · prueba' : ''}
        </Text>

        {!showCard && (
          <>
            <Text style={styles.badge}>📡 LA SEÑAL</Text>

            {phase === 'countdown' && (
              <>
                <Text style={styles.countdownLabel}>La Señal de hoy en</Text>
                <Text style={styles.timer}>{formatHMS(secondsToSignal)}</Text>
                <Text style={styles.hourHint}>Todos los días a las {BRAND.signalHour} · {CIUDAD}</Text>
              </>
            )}

            {phase === 'aviso' && (
              <>
                <Text style={styles.aviso}>La Señal empieza…</Text>
                <Text style={styles.timer}>{secondsLeft}s</Text>
              </>
            )}

            {phase === 'live' && (
              <View style={styles.liveBlock}>
                <Text style={styles.liveBadge}>● EN VIVO</Text>
                <Text style={styles.timer}>{formatHMS(secondsLeft)}</Text>
                <Text style={styles.question}>{question}</Text>
                <Text style={styles.liveCount}>{livePlayers} personas en vivo en {CIUDAD}</Text>

                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${Math.min(100, ((60 - secondsLeft) / 60) * 100)}%` }]}
                  />
                </View>

                <TextInput
                  style={styles.wordInput}
                  value={wordInput}
                  onChangeText={setWordInput}
                  placeholder="una palabra"
                  placeholderTextColor="#444"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  onSubmitEditing={() => {
                    submitWord(wordInput);
                    setWordInput('');
                  }}
                />
                <Pressable
                  style={styles.cta}
                  onPress={() => {
                    submitWord(wordInput);
                    setWordInput('');
                  }}>
                  <Text style={styles.ctaText}>MANDAR MI PALABRA</Text>
                </Pressable>
                {yourWord ? (
                  <Text style={styles.sent}>Quedó registrado: {yourWord} ✓</Text>
                ) : (
                  <Text style={styles.fomo}>Sin replay. Cuando se acabe el tiempo, se acabó.</Text>
                )}
                {error ? <Text style={styles.err}>{error}</Text> : null}
              </View>
            )}

            {yesterday && (
              <View style={styles.yesterdayBox}>
                <Text style={styles.yesterdayTitle}>Ayer en {CIUDAD}</Text>
                <Text style={styles.yesterdayWord}>{yesterday.winningWord.toUpperCase()}</Text>
                <Text style={styles.yesterdaySub}>
                  {yesterday.winningCount} personas · {yesterday.totalPlayers} participaron
                </Text>
              </View>
            )}
          </>
        )}

        {showCard && activeResult && (
          <>
            <TarjetaSenal result={activeResult} yourWord={yourWord} yourWordCount={yourWordCount} />
            <Pressable style={styles.cta} onPress={onShare}>
              <Text style={styles.ctaText}>COMPARTIR A WHATSAPP</Text>
            </Pressable>
            {phase === 'resultado' && (
              <Text style={styles.nextHint}>
                Próxima Señal en {formatHMS(secondsToSignal)} · {BRAND.signalHour}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  welcome: {
    fontSize: 22,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
    marginTop: 16,
  },
  nickHint: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  nickLabel: { fontSize: 16, fontFamily: 'Courier', color: '#fff', marginTop: 32 },
  nickInput: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    fontSize: 22,
    fontFamily: 'Courier',
    color: '#fff',
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: MircColors.neonCyan,
    textAlign: 'center',
  },
  hello: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textMuted },
  badge: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#FFD700', letterSpacing: 2 },
  countdownLabel: { fontSize: 14, fontFamily: 'Courier', color: MircColors.textMuted },
  timer: { fontSize: 44, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonGreen },
  hourHint: { fontSize: 12, fontFamily: 'Courier', color: '#666' },
  aviso: { fontSize: 20, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonPink },
  liveBlock: { width: '100%', alignItems: 'center', gap: 12 },
  liveBadge: { fontSize: 13, fontFamily: 'Courier', fontWeight: 'bold', color: '#ff4466' },
  question: {
    fontSize: 20,
    fontFamily: 'Courier',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
  },
  liveCount: { fontSize: 13, fontFamily: 'Courier', color: MircColors.neonCyan },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: MircColors.neonGreen },
  wordInput: {
    width: '100%',
    padding: 20,
    fontSize: 32,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonGreen,
    backgroundColor: '#0a0a12',
    borderWidth: 3,
    borderColor: MircColors.neonGreen,
    textAlign: 'center',
  },
  sent: { fontSize: 14, fontFamily: 'Courier', color: MircColors.neonPink },
  fomo: { fontSize: 11, fontFamily: 'Courier', color: '#666', fontStyle: 'italic' },
  yesterdayBox: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    gap: 4,
  },
  yesterdayTitle: { fontSize: 11, fontFamily: 'Courier', color: '#888' },
  yesterdayWord: { fontSize: 28, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonCyan },
  yesterdaySub: { fontSize: 11, fontFamily: 'Courier', color: '#666' },
  nextHint: { fontSize: 12, fontFamily: 'Courier', color: '#666', marginTop: 12, textAlign: 'center' },
  cta: {
    marginTop: 8,
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 28,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: { fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  err: { fontSize: 12, fontFamily: 'Courier', color: '#ff4466' },
});
