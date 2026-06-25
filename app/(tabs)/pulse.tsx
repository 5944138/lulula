import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LululaSpeechBubble from '@/components/brand/LululaSpeechBubble';
import InviteCard from '@/components/gamification/InviteCard';
import LevelBar from '@/components/gamification/LevelBar';
import StreakFlame from '@/components/gamification/StreakFlame';
import LivePulse from '@/components/LivePulse';
import MircWindow from '@/components/mirc/MircWindow';
import { useOinkWave } from '@/context/OinkWaveContext';
import { useOinkDimension } from '@/context/OinkDimensionContext';
import { useGlitchPig } from '@/context/GlitchPigContext';
import { useSnoutCast } from '@/context/SnoutCastContext';
import { useCollectiveMind } from '@/context/CollectiveMindContext';
import { getDailyGreeting } from '@/constants/lulula';
import {
  CITY_RIVALS,
  GLOBAL_CHANNELS,
  getCity,
  getDailyQuestion,
  isSala3pmOpen,
} from '@/constants/world';
import { MircColors } from '@/constants/theme';
import { useGamification } from '@/context/GamificationContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';
import { channelKey } from '@/lib/irc/utils';

export default function PulseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityId, cityName, tribeName, tribeEmoji } = useIdentity();
  const { nick, getChannel, joinChannel, sendChannel } = useIRC();
  const {
    streak,
    level,
    xp,
    levelProgress,
    dailyAnsweredToday,
    recordDailyAnswer,
    recordSala3pm,
    recordInvite,
  } = useGamification();
  const { phase, challenge, wavesPlayed, enterArena, countdownSec, liveSecLeft } = useOinkWave();
  const { filled, cityMessagesToday } = useOinkDimension();
  const { active: snoutLive, claimAir, broadcaster } = useSnoutCast();
  const { oracle, phase: glitchPhase, openArena } = useGlitchPig();
  const { phase: mindPhase, desire, progress, secLeft, mega, streak: mindStreak, lululaWhisper, openArena: openMind } = useCollectiveMind();

  const daily = useMemo(() => getDailyQuestion(), []);
  const lolaGreeting = useMemo(() => getDailyGreeting(), []);
  const city = cityId ? getCity(cityId) : null;
  const rivalId = cityId ? CITY_RIVALS[cityId] : undefined;
  const cityRoom = city ? getChannel(city.channel) : undefined;
  const onlineCount = cityRoom?.users.length ?? 0;
  const salaOpen = isSala3pmOpen();

  useEffect(() => {
    if (salaOpen) recordSala3pm();
  }, [salaOpen, recordSala3pm]);

  const answerDaily = () => {
    if (!city || dailyAnsweredToday) return;
    const ch = city.channel;
    joinChannel(ch);
    sendChannel(ch, `📊 QOTD: ${daily.question}`);
    recordDailyAnswer();
    router.push(`/channel/${channelKey(ch)}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MircWindow title={`PULSE — ${cityName || 'Global Wire'}`} style={styles.window}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LululaSpeechBubble line={lolaGreeting} size={64} />

          <View style={styles.topRow}>
            <StreakFlame streak={streak} />
            <View style={styles.levelWrap}>
              <LevelBar level={level} progress={levelProgress} xp={xp} />
              <Text style={styles.identity}>
                {tribeEmoji} {tribeName}
              </Text>
            </View>
          </View>

          <View style={styles.oracleCard}>
            <Text style={styles.oracleLabel}>🔮 OINK ORACLE</Text>
            <Text style={styles.oracleText}>{oracle}</Text>
            <Pressable onPress={() => router.push('/glitch-pig' as '/games/lola-run')}>
              <Text style={styles.oracleLink}>Cerdo Glitch →</Text>
            </Pressable>
          </View>

          {glitchPhase === 'invaded' && (
            <Pressable style={styles.glitchAlert} onPress={openArena}>
              <Text style={styles.glitchAlertText}>👾 GLITCH INVADIÓ TU CIUDAD — SALVAR</Text>
            </Pressable>
          )}

          {(mindPhase === 'active' || mindPhase === 'whisper') && (
            <Pressable
              style={[styles.mindCard, { borderColor: desire.color }]}
              onPress={openMind}>
              <Text style={[styles.mindBadge, { backgroundColor: desire.color }]}>
                {mega ? '⚡ MEGA' : '🌍 LIVE'} · {secLeft}s
              </Text>
              <Text style={[styles.mindTitle, { color: desire.color }]}>
                {desire.emoji} MENTE COLECTIVA
              </Text>
              <Text style={styles.mindSub}>{lululaWhisper}</Text>
              <Text style={styles.mindStat}>
                {progress}/100 resonancia · racha {mindStreak} · /deseo en IRC
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.mindIdleCard}
            onPress={() => router.push('/collective-mind' as '/games/lola-run')}>
            <Text style={styles.mindIdleBadge}>🧠 ÚNICO EN EL MUNDO</Text>
            <Text style={styles.mindIdleTitle}>MENTE COLECTIVA</Text>
            <Text style={styles.mindIdleSub}>
              El planeta susurra un deseo cada 7 min. Tu IRC es la respuesta.
            </Text>
          </Pressable>

          <Pressable style={styles.oinkWaveCard} onPress={enterArena}>
            <Text style={styles.oinkWaveBadge}>
              {phase === 'live' ? '🔴 EN VIVO' : phase === 'countdown' ? `⏳ ${countdownSec}s` : '✨ ÚNICO'}
            </Text>
            <Text style={styles.oinkWaveTitle}>🌊 OINK WAVE</Text>
            <Text style={styles.oinkWaveSub}>
              {challenge
                ? `${challenge.title} — tu chat IRC es el juego multijugador`
                : 'Cada 5 min: tu ciudad pelea en el wire. Nadie más hace esto.'}
            </Text>
            <Text style={styles.oinkWaveStat}>
              {wavesPlayed} waves jugadas
              {phase === 'live' ? ` · ${liveSecLeft}s restantes` : ''}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.snoutCard, snoutLive && styles.snoutLive]}
            onPress={() => router.push('/snoutcast' as '/games/lola-run')}>
            <Text style={styles.snoutBadge}>{snoutLive ? '🔴 LIVE' : '🎙️ ÚNICO'}</Text>
            <Text style={styles.snoutTitle}>SNOUTCAST</Text>
            <Text style={styles.snoutSub}>
              {snoutLive
                ? `${broadcaster} tiene el hocico — entra o manda 🐷`
                : 'Un micrófono. Una ciudad. Comando: /hog'}
            </Text>
            {!snoutLive && (
              <Pressable style={styles.snoutClaim} onPress={claimAir}>
                <Text style={styles.snoutClaimText}>TOMAR EL AIRE</Text>
              </Pressable>
            )}
          </Pressable>

          <Pressable style={styles.dimensionCard} onPress={() => router.push('/dimension' as '/games/lola-run')}>
            <Text style={styles.dimBadge}>🌀 EXCLUSIVO LULULA</Text>
            <Text style={styles.dimTitle}>LA DIMENSIÓN OINK</Text>
            <Text style={styles.dimSub}>
              {filled} píxeles pintados · {cityMessagesToday} msgs hoy{'\n'}
              Cada mensaje IRC deja huella en el universo paralelo
            </Text>
          </Pressable>

          <View style={[styles.pulseCard, onlineCount > 0 && styles.pulseLive]}>
            <View style={styles.pulseRow}>
              <LivePulse active={onlineCount > 0} size={16} />
              <Text style={styles.pulseNum}>{onlineCount || '—'}</Text>
            </View>
            <Text style={styles.pulseLabel}>online in {cityName || 'your city'}</Text>
            {onlineCount > 0 && <Text style={styles.liveDot}>LIVE RIGHT NOW</Text>}
          </View>

          {salaOpen ? (
            <Pressable
              style={styles.sala3pm}
              onPress={() => {
                joinChannel(GLOBAL_CHANNELS.sala3pm);
                router.push(`/channel/${channelKey(GLOBAL_CHANNELS.sala3pm)}`);
              }}>
              <Text style={styles.salaTitle}>🕒 THE 3PM ROOM — OPEN</Text>
              <Text style={styles.salaSub}>Log off school. Log on here. The whole world shows up.</Text>
            </Pressable>
          ) : (
            <View style={styles.salaClosed}>
              <Text style={styles.salaTitle}>🕒 The 3PM Room opens at 3:00 PM</Text>
              <Text style={styles.salaSub}>Come back after class. That's when the wire gets loud.</Text>
            </View>
          )}

          <Pressable
            style={[styles.dailyCard, dailyAnsweredToday && styles.dailyDone]}
            onPress={answerDaily}
            disabled={dailyAnsweredToday}>
            <Text style={styles.dailyBadge}>{dailyAnsweredToday ? '✅ DONE' : '+30 XP'}</Text>
            <Text style={styles.dailyTitle}>Question of the day</Text>
            <Text style={styles.dailyQ}>{daily.question}</Text>
            {!dailyAnsweredToday && (
              <Text style={styles.dailyCta}>[ TAP TO ANSWER IN YOUR CITY ]</Text>
            )}
          </Pressable>

          <View style={styles.quickRow}>
            {city && (
              <Pressable
                style={styles.quickBtn}
                onPress={() => router.push(`/channel/${channelKey(city.channel)}`)}>
                <Text style={styles.quickEmoji}>{city.emoji}</Text>
                <Text style={styles.quickText}>{city.name}</Text>
              </Pressable>
            )}
            <Pressable
              style={styles.quickBtn}
              onPress={() => router.push(`/channel/${channelKey(GLOBAL_CHANNELS.world)}`)}>
              <Text style={styles.quickEmoji}>🌐</Text>
              <Text style={styles.quickText}>World</Text>
            </Pressable>
            <Pressable
              style={styles.quickBtn}
              onPress={() => router.push(`/channel/${channelKey(GLOBAL_CHANNELS.confessions)}`)}>
              <Text style={styles.quickEmoji}>🤫</Text>
              <Text style={styles.quickText}>Confessions</Text>
            </Pressable>
          </View>

          {city && rivalId && (
            <View style={styles.rivalBox}>
              <Text style={styles.rivalText}>
                ⚔️ This week: who has more people online?{' '}
                {city.name} vs {getCity(rivalId).name}
              </Text>
            </View>
          )}

          <InviteCard
            cityName={cityName}
            tribeName={tribeName}
            nick={nick}
            onShared={recordInvite}
          />
        </ScrollView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MircColors.desktop, padding: 8 },
  window: { flex: 1 },
  scroll: { padding: 8, gap: 14, paddingBottom: 24 },
  topRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  levelWrap: { flex: 1, gap: 6 },
  identity: { fontSize: 11, fontFamily: 'Courier', color: MircColors.neonCyan },
  oinkWaveCard: {
    padding: 16,
    backgroundColor: '#FF00AA22',
    borderWidth: 3,
    borderColor: '#FF00AA',
    gap: 6,
  },
  oinkWaveBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  oinkWaveTitle: {
    fontSize: 20,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  oinkWaveSub: { fontSize: 12, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 18 },
  oinkWaveStat: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonCyan, marginTop: 4 },
  dimensionCard: {
    padding: 16,
    backgroundColor: '#1a0033',
    borderWidth: 3,
    borderColor: '#BF00FF',
    gap: 6,
  },
  dimBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#BF00FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dimTitle: {
    fontSize: 18,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#BF00FF',
  },
  dimSub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 17 },
  snoutCard: {
    padding: 16,
    backgroundColor: '#2a0015',
    borderWidth: 3,
    borderColor: '#FF4466',
    gap: 6,
  },
  snoutLive: { borderColor: '#FF0000', backgroundColor: '#3a0018' },
  snoutBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#FF4466',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  snoutTitle: { fontSize: 20, fontFamily: 'Courier', fontWeight: 'bold', color: '#FF4466' },
  snoutSub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 17 },
  snoutClaim: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#FF00AA',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  snoutClaimText: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#fff' },
  oracleCard: {
    padding: 14,
    backgroundColor: '#1a0a20',
    borderWidth: 2,
    borderColor: '#BF00FF',
    gap: 6,
  },
  oracleLabel: { fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold', color: '#BF00FF' },
  oracleText: { fontSize: 13, fontFamily: 'Courier', color: MircColors.textLight, fontStyle: 'italic', lineHeight: 19 },
  oracleLink: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonCyan, marginTop: 4 },
  glitchAlert: {
    padding: 14,
    backgroundColor: '#FF0044',
    borderWidth: 2,
    borderColor: '#fff',
  },
  glitchAlertText: { fontSize: 13, fontFamily: 'Courier', fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  mindCard: {
    padding: 16,
    backgroundColor: '#0a0a18',
    borderWidth: 3,
    gap: 6,
  },
  mindBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mindTitle: { fontSize: 20, fontFamily: 'Courier', fontWeight: 'bold' },
  mindSub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 17, fontStyle: 'italic' },
  mindStat: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonCyan, marginTop: 4 },
  mindIdleCard: {
    padding: 14,
    backgroundColor: '#0a1020',
    borderWidth: 2,
    borderColor: '#00E5FF',
    gap: 4,
  },
  mindIdleBadge: { fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: '#00E5FF' },
  mindIdleTitle: { fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: '#00E5FF' },
  mindIdleSub: { fontSize: 10, fontFamily: 'Courier', color: MircColors.textMuted, lineHeight: 15 },
  pulseCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: MircColors.cardDark,
    borderWidth: 2,
    borderColor: MircColors.borderDark,
    gap: 8,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseLive: { borderColor: MircColors.neonGreen, backgroundColor: '#39ff1411' },
  pulseNum: {
    fontSize: 48,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  pulseLabel: { fontSize: 13, fontFamily: 'Courier', color: MircColors.textMuted },
  liveDot: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.neonGreen,
    fontWeight: 'bold',
  },
  sala3pm: {
    backgroundColor: MircColors.neonPink,
    padding: 14,
    borderWidth: 2,
    borderColor: '#ff66cc',
  },
  salaClosed: {
    backgroundColor: '#333',
    padding: 14,
    borderWidth: 2,
    borderColor: MircColors.borderDark,
  },
  salaTitle: { fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.textLight },
  salaSub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textMuted, marginTop: 4 },
  dailyCard: {
    backgroundColor: MircColors.cardDark,
    padding: 14,
    borderWidth: 2,
    borderColor: MircColors.neonCyan,
    gap: 6,
  },
  dailyDone: { borderColor: MircColors.neonGreen, opacity: 0.8 },
  dailyBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: MircColors.neonCyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dailyTitle: { fontSize: 13, fontFamily: 'Courier', color: MircColors.neonPink, fontWeight: 'bold' },
  dailyQ: { fontSize: 14, fontFamily: 'Courier', color: MircColors.textLight, lineHeight: 20 },
  dailyCta: { fontSize: 10, fontFamily: 'Courier', color: MircColors.neonCyan, marginTop: 6 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: MircColors.windowBg,
    borderWidth: 2,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
  },
  quickEmoji: { fontSize: 24 },
  quickText: { fontSize: 10, fontFamily: 'Courier', color: MircColors.text, marginTop: 4, textAlign: 'center' },
  rivalBox: {
    padding: 10,
    backgroundColor: '#ff660022',
    borderWidth: 1,
    borderColor: '#ff6600',
  },
  rivalText: { fontSize: 11, fontFamily: 'Courier', color: '#ffaa00', lineHeight: 16 },
});
