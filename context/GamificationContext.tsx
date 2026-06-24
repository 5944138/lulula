import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { LEGACY_KEYS, STORAGE_KEYS, pickMigrated } from '@/constants/storage';
import {
  BADGES,
  XP_DAILY_BONUS,
  XP_LEVEL_STEP,
  XP_PER_MESSAGE,
  type BadgeId,
} from '@/constants/world';

const KEY_PAIRS = [
  ['xp', STORAGE_KEYS.xp, LEGACY_KEYS.xp],
  ['streak', STORAGE_KEYS.streak, LEGACY_KEYS.streak],
  ['lastDay', STORAGE_KEYS.lastDay, LEGACY_KEYS.lastDay],
  ['badges', STORAGE_KEYS.badges, LEGACY_KEYS.badges],
  ['msgs', STORAGE_KEYS.msgs, LEGACY_KEYS.msgs],
  ['rooms', STORAGE_KEYS.rooms, LEGACY_KEYS.rooms],
  ['invites', STORAGE_KEYS.invites, LEGACY_KEYS.invites],
  ['dailyAnswered', STORAGE_KEYS.dailyAnswered, LEGACY_KEYS.dailyAnswered],
] as const;

type GamificationContextValue = {
  xp: number;
  level: number;
  streak: number;
  messageCount: number;
  roomsJoined: number;
  invitesSent: number;
  badges: BadgeId[];
  dailyAnsweredToday: boolean;
  levelProgress: number;
  recordLogin: () => void;
  recordMessage: () => void;
  recordRoomJoin: () => void;
  recordInvite: () => void;
  recordDailyAnswer: () => void;
  recordSala3pm: () => void;
};

const GamificationContext = createContext<GamificationContextValue | null>(null);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [roomsJoined, setRoomsJoined] = useState(0);
  const [invitesSent, setInvitesSent] = useState(0);
  const [badges, setBadges] = useState<BadgeId[]>([]);
  const [dailyAnsweredToday, setDailyAnsweredToday] = useState(false);
  const [lastDay, setLastDay] = useState('');

  const level = Math.floor(xp / XP_LEVEL_STEP) + 1;
  const levelProgress = (xp % XP_LEVEL_STEP) / XP_LEVEL_STEP;

  const unlockBadge = useCallback(async (id: BadgeId, current: BadgeId[]) => {
    if (current.includes(id)) return current;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const next = [...current, id];
    await AsyncStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(next));
    return next;
  }, []);

  const addXp = useCallback(async (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      AsyncStorage.setItem(STORAGE_KEYS.xp, String(next));
      return next;
    });
  }, []);

  const checkBadges = useCallback(
    async (data: {
      streak: number;
      msgs: number;
      rooms: number;
      invites: number;
      currentBadges: BadgeId[];
    }) => {
      let b = data.currentBadges;
      if (data.streak >= 3) b = await unlockBadge('streak-3', b);
      if (data.streak >= 7) b = await unlockBadge('streak-7', b);
      if (data.streak >= 30) b = await unlockBadge('streak-30', b);
      if (data.msgs >= 50) b = await unlockBadge('msgs-50', b);
      if (data.msgs >= 200) b = await unlockBadge('msgs-200', b);
      if (data.rooms >= 5) b = await unlockBadge('rooms-5', b);
      if (data.invites >= 3) b = await unlockBadge('invite-3', b);
      setBadges(b);
    },
    [unlockBadge],
  );

  useEffect(() => {
    const allKeys = KEY_PAIRS.flatMap(([, k, legacy]) => [k, legacy]);
    AsyncStorage.multiGet(allKeys).then((pairs) => {
      setXp(Number(pickMigrated(pairs, STORAGE_KEYS.xp, LEGACY_KEYS.xp) || 0));
      setStreak(Number(pickMigrated(pairs, STORAGE_KEYS.streak, LEGACY_KEYS.streak) || 0));
      setLastDay(pickMigrated(pairs, STORAGE_KEYS.lastDay, LEGACY_KEYS.lastDay) || '');
      setMessageCount(Number(pickMigrated(pairs, STORAGE_KEYS.msgs, LEGACY_KEYS.msgs) || 0));
      setRoomsJoined(Number(pickMigrated(pairs, STORAGE_KEYS.rooms, LEGACY_KEYS.rooms) || 0));
      setInvitesSent(Number(pickMigrated(pairs, STORAGE_KEYS.invites, LEGACY_KEYS.invites) || 0));
      try {
        const raw = pickMigrated(pairs, STORAGE_KEYS.badges, LEGACY_KEYS.badges);
        setBadges(JSON.parse(raw || '[]'));
      } catch {
        setBadges([]);
      }
      const daily = pickMigrated(pairs, STORAGE_KEYS.dailyAnswered, LEGACY_KEYS.dailyAnswered);
      setDailyAnsweredToday(daily === todayKey());
    });
  }, []);

  const recordLogin = useCallback(() => {
    const today = todayKey();
    if (lastDay === today) return;

    let nextStreak = 1;
    if (lastDay === yesterdayKey()) {
      nextStreak = streak + 1;
    }

    setStreak(nextStreak);
    setLastDay(today);
    AsyncStorage.multiSet([
      [STORAGE_KEYS.streak, String(nextStreak)],
      [STORAGE_KEYS.lastDay, today],
    ]);

    addXp(XP_DAILY_BONUS);
    unlockBadge('first-connect', badges).then((b) => {
      setBadges(b);
      checkBadges({
        streak: nextStreak,
        msgs: messageCount,
        rooms: roomsJoined,
        invites: invitesSent,
        currentBadges: b,
      });
    });

    if (nextStreak > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [
    lastDay,
    streak,
    badges,
    messageCount,
    roomsJoined,
    invitesSent,
    addXp,
    unlockBadge,
    checkBadges,
  ]);

  const recordMessage = useCallback(() => {
    setMessageCount((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.msgs, String(next));
      checkBadges({
        streak,
        msgs: next,
        rooms: roomsJoined,
        invites: invitesSent,
        currentBadges: badges,
      });
      return next;
    });
    addXp(XP_PER_MESSAGE);
  }, [addXp, badges, checkBadges, invitesSent, roomsJoined, streak]);

  const recordRoomJoin = useCallback(() => {
    setRoomsJoined((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.rooms, String(next));
      checkBadges({
        streak,
        msgs: messageCount,
        rooms: next,
        invites: invitesSent,
        currentBadges: badges,
      });
      return next;
    });
    addXp(8);
  }, [badges, checkBadges, invitesSent, messageCount, streak, addXp]);

  const recordInvite = useCallback(() => {
    setInvitesSent((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.invites, String(next));
      checkBadges({
        streak,
        msgs: messageCount,
        rooms: roomsJoined,
        invites: next,
        currentBadges: badges,
      });
      return next;
    });
    addXp(25);
  }, [badges, checkBadges, messageCount, roomsJoined, streak, addXp]);

  const recordDailyAnswer = useCallback(() => {
    const today = todayKey();
    setDailyAnsweredToday(true);
    AsyncStorage.setItem(STORAGE_KEYS.dailyAnswered, today);
    addXp(30);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [addXp]);

  const recordSala3pm = useCallback(() => {
    unlockBadge('sala3pm', badges).then(setBadges);
    addXp(20);
  }, [addXp, badges, unlockBadge]);

  const value = useMemo(
    () => ({
      xp,
      level,
      streak,
      messageCount,
      roomsJoined,
      invitesSent,
      badges,
      dailyAnsweredToday,
      levelProgress,
      recordLogin,
      recordMessage,
      recordRoomJoin,
      recordInvite,
      recordDailyAnswer,
      recordSala3pm,
    }),
    [
      xp,
      level,
      streak,
      messageCount,
      roomsJoined,
      invitesSent,
      badges,
      dailyAnsweredToday,
      levelProgress,
      recordLogin,
      recordMessage,
      recordRoomJoin,
      recordInvite,
      recordDailyAnswer,
      recordSala3pm,
    ],
  );

  return (
    <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}

export function getBadgeInfo(id: BadgeId) {
  return BADGES.find((b) => b.id === id);
}
