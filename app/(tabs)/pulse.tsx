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
