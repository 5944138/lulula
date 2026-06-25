import { useState } from 'react';
import {
  Image,
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

import { BRAND } from '@/constants/config';
import { OINK_WAVE_SHARE } from '@/constants/oinkWave';
import { useOinkWave } from '@/context/OinkWaveContext';
import { WA } from '@/constants/whatsappTheme';

/** Arena fullscreen — el único juego donde IRC es la mecánica */
export default function OinkWaveArena() {
  const insets = useSafeAreaInsets();
  const {
    phase,
    challenge,
    countdownSec,
    liveSecLeft,
    isMega,
    playerScore,
    cityScore,
    liveFeed,
    result,
    arenaOpen,
    cityName,
    dismissResults,
    submitFromArena,
  } = useOinkWave();

  const [input, setInput] = useState('');

  if (!arenaOpen || !challenge) return null;

  const accent = challenge.accent;
  const progress =
    phase === 'live' ? liveSecLeft / challenge.durationSec : countdownSec / 45;

  const share = async () => {
    if (!result) return;
    const msg = OINK_WAVE_SHARE(
      cityName,
      result.rivalName,
      result.cityWon,
      result.playerScore,
      challenge.title,
    );
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  const quickSend = (text: string) => {
    submitFromArena(text);
    setInput('');
  };

  return (
    <View style={[styles.overlay, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0B141A', '#1a0a20', '#0B141A']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.mascot} />
        <View style={styles.headerText}>
          <Text style={styles.brand}>OINK WAVE</Text>
          <Text style={[styles.challengeTitle, { color: accent }]}>{challenge.title}</Text>
          {isMega && <Text style={styles.mega}>🌊 MEGA WAVE 3PM</Text>}
        </View>
        {phase !== 'live' && (
          <Pressable onPress={dismissResults} hitSlop={12}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.timerBar, { width: `${Math.max(4, progress * 100)}%`, backgroundColor: accent }]} />

      {phase === 'countdown' && (
        <View style={styles.center}>
          <Text style={styles.countdown}>{countdownSec}</Text>
          <Text style={styles.hook}>{challenge.hook}</Text>
          <Text style={styles.instruction}>{challenge.instruction}</Text>
          <Text style={styles.unique}>
            🧠 Esto no existe en ninguna otra app:{'\n'}tu mensaje de IRC = tu jugada
          </Text>
        </View>
      )}

      {phase === 'live' && (
        <View style={styles.liveBody}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreBox}>Tú: {playerScore}</Text>
            <Text style={[styles.timer, { color: accent }]}>{liveSecLeft}s</Text>
            <Text style={styles.scoreBox}>Ciudad: {cityScore}</Text>
          </View>
          <Text style={styles.instructionLive}>{challenge.instruction}</Text>

          <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
            {liveFeed.map((line, i) => (
              <Text key={i} style={[styles.feedLine, i === 0 && { color: accent }]}>
                {line}
              </Text>
            ))}
          </ScrollView>

          <View style={styles.quickRow}>
            {challenge.type === 'emoji_storm' && challenge.targetEmoji && (
              <Pressable style={styles.quickBtn} onPress={() => quickSend(challenge.targetEmoji!)}>
                <Text style={styles.quickEmoji}>{challenge.targetEmoji}</Text>
              </Pressable>
            )}
            {challenge.type === 'oink_flood' && (
              <>
                <Pressable style={styles.quickBtn} onPress={() => quickSend('oink')}>
                  <Text style={styles.quickText}>oink</Text>
                </Pressable>
                <Pressable style={styles.quickBtn} onPress={() => quickSend('🐷 oink!')}>
                  <Text style={styles.quickEmoji}>🐷</Text>
                </Pressable>
              </>
            )}
            {challenge.type === 'phrase_lock' && challenge.targetPhrase && (
              <Pressable style={styles.quickBtnWide} onPress={() => quickSend(challenge.targetPhrase!)}>
                <Text style={styles.quickText}>{challenge.targetPhrase}</Text>
              </Pressable>
            )}
            {challenge.type === 'city_siege' && (
              <Pressable style={styles.quickBtnWide} onPress={() => quickSend(`⚔️ ${cityName} ataca!`)}>
                <Text style={styles.quickText}>⚔️ Atacar</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Manda al IRC de tu ciudad…"
              placeholderTextColor={WA.textSecondary}
              onSubmitEditing={() => {
                if (input.trim()) quickSend(input.trim());
              }}
            />
            <Pressable style={[styles.send, { backgroundColor: accent }]} onPress={() => input.trim() && quickSend(input.trim())}>
              <Text style={styles.sendText}>→</Text>
            </Pressable>
          </View>
        </View>
      )}

      {phase === 'results' && result && (
        <View style={styles.center}>
          <Text style={styles.resultEmoji}>{result.cityWon ? '🏆' : '💀'}</Text>
          <Text style={styles.resultTitle}>
            {result.cityWon ? `${cityName} GANÓ` : `${result.rivalName} ganó esta vez`}
          </Text>
          <Text style={styles.resultScores}>
            {cityName} {result.cityScore} — {result.rivalScore} {result.rivalName}
          </Text>
          <Text style={styles.resultPlayer}>
            Tú: {result.playerScore} pts · +{result.coinsEarned} 🪙
          </Text>

          <Pressable style={[styles.shareBtn, { backgroundColor: accent }]} onPress={share}>
            <Text style={styles.shareText}>📣 Compartir Oink Wave</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={dismissResults}>
            <Text style={styles.ghostText}>Volver al wire</Text>
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
    zIndex: 200,
    backgroundColor: WA.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  mascot: { width: 56, height: 56, borderRadius: 14, borderWidth: 2, borderColor: WA.green },
  headerText: { flex: 1 },
  brand: { fontSize: 11, fontWeight: '800', color: WA.textSecondary, letterSpacing: 2 },
  challengeTitle: { fontSize: 22, fontWeight: '800', color: WA.text },
  mega: { fontSize: 12, color: '#FFAA00', fontWeight: '700', marginTop: 2 },
  close: { fontSize: 22, color: WA.textSecondary, padding: 8 },
  timerBar: { height: 4, marginHorizontal: 16, borderRadius: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  countdown: { fontSize: 96, fontWeight: '900', color: WA.teal, fontVariant: ['tabular-nums'] },
  hook: { fontSize: 18, fontWeight: '700', color: WA.text, textAlign: 'center' },
  instruction: { fontSize: 15, color: WA.textSecondary, textAlign: 'center', lineHeight: 22 },
  unique: {
    marginTop: 24,
    fontSize: 13,
    color: WA.teal,
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: WA.inputBg,
    padding: 16,
    borderRadius: 12,
  },
  liveBody: { flex: 1, padding: 16, gap: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBox: { fontSize: 13, fontWeight: '700', color: WA.text },
  timer: { fontSize: 28, fontWeight: '900' },
  instructionLive: { fontSize: 14, color: WA.textSecondary, textAlign: 'center' },
  feed: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: WA.green,
    borderRadius: 8,
  },
  feedContent: { padding: 10, gap: 4 },
  feedLine: { fontFamily: 'Courier', fontSize: 12, color: WA.teal },
  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  quickBtn: {
    backgroundColor: WA.inputBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: WA.green,
  },
  quickBtnWide: {
    backgroundColor: WA.inputBg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: WA.green,
  },
  quickEmoji: { fontSize: 24 },
  quickText: { fontSize: 15, fontWeight: '700', color: WA.text },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: WA.inputBg,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: WA.text,
    fontSize: 15,
  },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 22, fontWeight: '800', color: '#000' },
  resultEmoji: { fontSize: 64 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: WA.text, textAlign: 'center' },
  resultScores: { fontSize: 16, color: WA.teal, fontWeight: '600' },
  resultPlayer: { fontSize: 14, color: WA.textSecondary },
  shareBtn: { marginTop: 16, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 28, width: '100%', alignItems: 'center' },
  shareText: { fontSize: 17, fontWeight: '700', color: '#000' },
  ghostBtn: { paddingVertical: 14 },
  ghostText: { fontSize: 15, color: WA.textSecondary },
});
