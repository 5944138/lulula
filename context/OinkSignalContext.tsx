import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
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

import {
  getQuestionForSlot,
  getSignalPhase,
  getSignalSlot,
  msUntilSignal,
  parseSignalWord,
  pickCityWord,
  secLeftInPhase,
  SIGNAL_LIVE_SEC,
  SIGNAL_SHARE,
  simulateGlobalWinner,
  type SignalPhase,
  type SignalQuestion,
} from '@/constants/oinkSignal';
import { getCity } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

export type SignalResult = {
  cityWord: string;
  cityVotes: number;
  globalWord: string;
  globalCity: string;
  globalVotes: number;
  won: boolean;
  question: SignalQuestion;
};

export type SignalHistoryEntry = {
  word: string;
  city: string;
  slot: number;
  at: number;
};

type OinkSignalContextValue = {
  phase: SignalPhase;
  question: SignalQuestion;
  secLeft: number;
  msUntilNext: number;
  cityTally: Record<string, number>;
  leadingWord: string;
  yourWord: string | null;
  result: SignalResult | null;
  history: SignalHistoryEntry[];
  signalsJoined: number;
  dropOpen: boolean;
  openDrop: () => void;
  closeDrop: () => void;
  dismissReveal: () => void;
  submitWord: (text: string) => void;
  cityName: string;
};

const OinkSignalContext = createContext<OinkSignalContextValue | null>(null);

export function OinkSignalProvider({ children }: { children: ReactNode }) {
  const { cityId, cityName } = useIdentity();
  const { nick, getChannel, sendChannel } = useIRC();
  const { grantCoins } = useEconomy();

  const [phase, setPhase] = useState<SignalPhase>('dormant');
  const [secLeft, setSecLeft] = useState(0);
  const [msUntilNext, setMsUntilNext] = useState(0);
  const [cityTally, setCityTally] = useState<Record<string, number>>({});
  const [yourWord, setYourWord] = useState<string | null>(null);
  const [result, setResult] = useState<SignalResult | null>(null);
  const [history, setHistory] = useState<SignalHistoryEntry[]>([]);
  const [signalsJoined, setSignalsJoined] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);

  const slotRef = useRef(0);
  const tallyRef = useRef(new Map<string, number>());
  const processedRef = useRef(new Set<string>());
  const revealedRef = useRef(false);
  const autoOpenedRef = useRef(false);

  const city = cityId ? getCity(cityId) : null;

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.signalHistory, STORAGE_KEYS.signalsJoined]).then(([h, j]) => {
      if (h[1]) {
        try {
          setHistory(JSON.parse(h[1]));
        } catch {
          /* noop */
        }
      }
      if (j[1]) setSignalsJoined(Number(j[1]) || 0);
    });
  }, []);

  const leadingWord = useMemo(() => {
    const entries = Object.entries(cityTally);
    if (entries.length === 0) return '—';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [cityTally]);

  const addVote = useCallback((word: string, fromNick: string) => {
    if (phase !== 'live') return;
    const tally = tallyRef.current;
    tally.set(word, (tally.get(word) ?? 0) + 1);
    setCityTally(Object.fromEntries(tally));
    if (fromNick === nick) setYourWord(word);
  }, [phase, nick]);

  const finalizeReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;

    const cityWord = pickCityWord(tallyRef.current);
    const cityVotes = tallyRef.current.get(cityWord) ?? 0;
    const q = getQuestionForSlot(slotRef.current);
    const global = simulateGlobalWinner(slotRef.current, cityWord, cityVotes, cityName || 'Tu ciudad');
    const won = global.city === (cityName || 'Tu ciudad');

    const res: SignalResult = {
      cityWord,
      cityVotes,
      globalWord: global.word,
      globalCity: global.city,
      globalVotes: global.globalVotes,
      won,
      question: q,
    };

    setResult(res);
    setPhase('reveal');
    setDropOpen(true);

    const coins = won ? 60 : cityVotes > 0 ? 20 : 5;
    grantCoins(coins);
    Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );

    const entry: SignalHistoryEntry = {
      word: global.word,
      city: global.city,
      slot: slotRef.current,
      at: Date.now(),
    };
    const nextHistory = [entry, ...history].slice(0, 12);
    setHistory(nextHistory);

    const joined = signalsJoined + (cityVotes > 0 ? 1 : 0);
    setSignalsJoined(joined);

    AsyncStorage.multiSet([
      [STORAGE_KEYS.signalHistory, JSON.stringify(nextHistory)],
      [STORAGE_KEYS.signalsJoined, String(joined)],
    ]);

    if (city) {
      const tag = won ? '🏆 SEÑAL OINK' : '📡 SEÑAL OINK';
      sendChannel(
        city.channel,
        `${tag} · Palabra del planeta: "${global.word.toUpperCase()}" — ${global.city} · ${global.globalVotes.toLocaleString()} almas`,
      );
    }
  }, [city, cityName, grantCoins, history, sendChannel, signalsJoined]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const slot = getSignalSlot(now);
      const p = getSignalPhase(now);

      if (slot !== slotRef.current) {
        slotRef.current = slot;
        tallyRef.current = new Map();
        processedRef.current = new Set();
        revealedRef.current = false;
        autoOpenedRef.current = false;
        setCityTally({});
        setYourWord(null);
        setResult(null);
      }

      setPhase(p);
      setSecLeft(secLeftInPhase(now));
      setMsUntilNext(msUntilSignal(now));

      if (p === 'countdown' && !autoOpenedRef.current) {
        autoOpenedRef.current = true;
        setDropOpen(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      if (p === 'reveal' && !revealedRef.current) {
        finalizeReveal();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [finalizeReveal]);

  useEffect(() => {
    if (!city || phase !== 'live') return;
    const room = getChannel(city.channel);
    if (!room) return;

    for (const msg of room.messages) {
      const key = `sig-${msg.id}`;
      if (processedRef.current.has(key)) continue;
      const word = parseSignalWord(msg.text);
      if (!word) continue;
      processedRef.current.add(key);
      addVote(word, msg.nick ?? 'anon');
    }
  }, [addVote, city, getChannel, phase]);

  const submitWord = useCallback(
    (text: string) => {
      const word = parseSignalWord(text.startsWith('/senal') ? text : `/senal ${text}`);
      if (!word || !city) return;
      addVote(word, nick);
      sendChannel(city.channel, `/senal ${word}`);
    },
    [addVote, city, nick, sendChannel],
  );

  const value = useMemo(
    (): OinkSignalContextValue => ({
      phase,
      question: getQuestionForSlot(slotRef.current),
      secLeft,
      msUntilNext,
      cityTally,
      leadingWord,
      yourWord,
      result,
      history,
      signalsJoined,
      dropOpen,
      openDrop: () => setDropOpen(true),
      closeDrop: () => setDropOpen(false),
      dismissReveal: () => {
        setDropOpen(false);
        setResult(null);
        setPhase(getSignalPhase());
      },
      submitWord,
      cityName: cityName || '',
    }),
    [
      phase,
      secLeft,
      msUntilNext,
      cityTally,
      leadingWord,
      yourWord,
      result,
      history,
      signalsJoined,
      dropOpen,
      submitWord,
      cityName,
    ],
  );

  return <OinkSignalContext.Provider value={value}>{children}</OinkSignalContext.Provider>;
}

export function useOinkSignal() {
  const ctx = useContext(OinkSignalContext);
  if (!ctx) throw new Error('useOinkSignal must be used within OinkSignalProvider');
  return ctx;
}
