import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { BROADCAST_SEC, isHogClaim, isOinkReaction } from '@/constants/snoutCast';
import { getCity } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

export type SnoutCastEndStats = {
  broadcaster: string;
  oinkReactions: number;
  listeners: number;
  wasYou: boolean;
};

type SnoutCastContextValue = {
  active: boolean;
  broadcaster: string | null;
  secLeft: number;
  oinkReactions: number;
  listeners: number;
  isYouOnAir: boolean;
  queue: string[];
  sessionsTotal: number;
  lastEnd: SnoutCastEndStats | null;
  claimAir: () => void;
  dismissEnd: () => void;
};

const SnoutCastContext = createContext<SnoutCastContextValue | null>(null);

export function SnoutCastProvider({ children }: { children: ReactNode }) {
  const { cityId } = useIdentity();
  const { nick, getChannel, sendChannel } = useIRC();
  const { grantCoins } = useEconomy();

  const [active, setActive] = useState(false);
  const [broadcaster, setBroadcaster] = useState<string | null>(null);
  const [secLeft, setSecLeft] = useState(0);
  const [oinkReactions, setOinkReactions] = useState(0);
  const [listeners, setListeners] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [lastEnd, setLastEnd] = useState<SnoutCastEndStats | null>(null);

  const processedRef = useRef(new Set<string>());
  const broadcasterRef = useRef<string | null>(null);
  const oinkRef = useRef(0);
  const listenersRef = useRef(0);

  const city = cityId ? getCity(cityId) : null;
  const isYouOnAir = active && broadcaster === nick;

  useEffect(() => {
    oinkRef.current = oinkReactions;
  }, [oinkReactions]);

  useEffect(() => {
    listenersRef.current = listeners;
  }, [listeners]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.snoutCastSessions).then((v) => {
      if (v) setSessionsTotal(Number(v) || 0);
    });
  }, []);

  const startBroadcast = useCallback((who: string, listenerCount: number) => {
    broadcasterRef.current = who;
    setBroadcaster(who);
    setActive(true);
    setSecLeft(BROADCAST_SEC);
    setOinkReactions(0);
    oinkRef.current = 0;
    const lc = Math.max(listenerCount, 1);
    setListeners(lc);
    listenersRef.current = lc;
    processedRef.current.clear();
  }, []);

  const endBroadcast = useCallback(() => {
    const who = broadcasterRef.current;
    if (!who) return;

    setLastEnd({
      broadcaster: who,
      oinkReactions: oinkRef.current,
      listeners: listenersRef.current,
      wasYou: who === nick,
    });

    if (who === nick) {
      grantCoins(25 + oinkRef.current * 2);
      setSessionsTotal((s) => {
        const next = s + 1;
        AsyncStorage.setItem(STORAGE_KEYS.snoutCastSessions, String(next));
        return next;
      });
    }

    setActive(false);
    setBroadcaster(null);
    broadcasterRef.current = null;
    setSecLeft(0);

    setQueue((q) => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      const room = city ? getChannel(city.channel) : undefined;
      startBroadcast(next, room?.users.length ?? 1);
      return rest;
    });
  }, [nick, grantCoins, city, getChannel, startBroadcast]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(endBroadcast, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, endBroadcast]);

  useEffect(() => {
    if (!city) return;
    const room = getChannel(city.channel);
    if (!room) return;

    setListeners(room.users.length);
    listenersRef.current = room.users.length;

    for (const msg of room.messages) {
      if (processedRef.current.has(msg.id)) continue;
      if (msg.type !== 'chat' && msg.type !== 'action') continue;
      processedRef.current.add(msg.id);

      const who = msg.nick ?? '?';
      const text = msg.text;

      if (isHogClaim(text)) {
        if (!active) {
          startBroadcast(who, room.users.length);
        } else if (who !== broadcasterRef.current) {
          setQueue((q) => (q.includes(who) ? q : [...q, who]));
        }
        continue;
      }

      if (active && who !== broadcasterRef.current && isOinkReaction(text)) {
        setOinkReactions((n) => {
          oinkRef.current = n + 1;
          return n + 1;
        });
      }
    }
  }, [city, getChannel, active, startBroadcast]);

  const claimAir = useCallback(() => {
    if (!city) return;
    sendChannel(city.channel, '/hog 🎙️ EN EL AIRE');
  }, [city, sendChannel]);

  const value = useMemo(
    () => ({
      active,
      broadcaster,
      secLeft,
      oinkReactions,
      listeners,
      isYouOnAir,
      queue,
      sessionsTotal,
      lastEnd,
      claimAir,
      dismissEnd: () => setLastEnd(null),
    }),
    [
      active,
      broadcaster,
      secLeft,
      oinkReactions,
      listeners,
      isYouOnAir,
      queue,
      sessionsTotal,
      lastEnd,
      claimAir,
    ],
  );

  return <SnoutCastContext.Provider value={value}>{children}</SnoutCastContext.Provider>;
}

export function useSnoutCast() {
  const ctx = useContext(SnoutCastContext);
  if (!ctx) throw new Error('useSnoutCast must be used within SnoutCastProvider');
  return ctx;
}
