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

import {
  BANISH_SEQUENCE,
  BANISH_WINDOW_SEC,
  generateOracle,
  matchesSequenceStep,
  pickSpawnLine,
  pickTaunt,
  SPAWN_INTERVAL_MS,
} from '@/constants/glitchPig';
import { getCity } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

export type GlitchPhase = 'dormant' | 'invaded' | 'banished';

type GlitchPigContextValue = {
  phase: GlitchPhase;
  secLeft: number;
  progress: number;
  spawnLine: string;
  taunt: string;
  helpers: string[];
  banishesTotal: number;
  oracle: string;
  arenaOpen: boolean;
  openArena: () => void;
  closeArena: () => void;
  contributeLetter: (letter: string) => void;
  cityName: string;
  nick: string;
  sequence: readonly string[];
};

const GlitchPigContext = createContext<GlitchPigContextValue | null>(null);

export function GlitchPigProvider({ children }: { children: ReactNode }) {
  const { cityId, cityName } = useIdentity();
  const { nick, getChannel, sendChannel } = useIRC();
  const { grantCoins } = useEconomy();

  const [phase, setPhase] = useState<GlitchPhase>('dormant');
  const [secLeft, setSecLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [spawnLine, setSpawnLine] = useState('');
  const [taunt, setTaunt] = useState('');
  const [helpers, setHelpers] = useState<string[]>([]);
  const [banishesTotal, setBanishesTotal] = useState(0);
  const [oracle, setOracle] = useState('');
  const [arenaOpen, setArenaOpen] = useState(false);

  const processedRef = useRef(new Set<string>());
  const progressRef = useRef(0);
  const helpersRef = useRef<string[]>([]);
  const spawnTimeRef = useRef(0);

  const city = cityId ? getCity(cityId) : null;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.glitchBanishes).then((v) => {
      if (v) setBanishesTotal(Number(v) || 0);
    });
  }, []);

  useEffect(() => {
    if (!city) return;
    const room = getChannel(city.channel);
    if (!room) return;
    const words = room.messages
      .filter((m) => m.type === 'chat')
      .slice(-30)
      .flatMap((m) => m.text.split(/\s+/))
      .filter((w) => w.length > 2);
    setOracle(generateOracle(words));
  }, [city, getChannel]);

  const spawn = useCallback(() => {
    const seed = Date.now();
    progressRef.current = 0;
    helpersRef.current = [];
    spawnTimeRef.current = Date.now();
    processedRef.current.clear();
    setProgress(0);
    setHelpers([]);
    setSpawnLine(pickSpawnLine(seed));
    setTaunt(pickTaunt(seed));
    setSecLeft(BANISH_WINDOW_SEC);
    setPhase('invaded');
    setArenaOpen(true);
  }, []);

  const banish = useCallback(() => {
    setPhase('banished');
    setArenaOpen(true);
    grantCoins(50 + helpersRef.current.length * 10);
    const total = banishesTotal + 1;
    setBanishesTotal(total);
    AsyncStorage.setItem(STORAGE_KEYS.glitchBanishes, String(total));
    if (city) {
      sendChannel(city.channel, `👾 GLITCH BANEADO — ${cityName} salvo el wire 🐷`);
    }
    setTimeout(() => {
      setPhase('dormant');
      setArenaOpen(false);
      progressRef.current = 0;
      setProgress(0);
    }, 8000);
  }, [grantCoins, banishesTotal, city, cityName, sendChannel]);

  useEffect(() => {
    if (!cityId || phase === 'invaded') return;
    const slot = Math.floor(Date.now() / SPAWN_INTERVAL_MS);
    const nextAt = (slot + 1) * SPAWN_INTERVAL_MS;
    const delay = nextAt - Date.now() + Math.random() * 30_000;
    const t = setTimeout(spawn, delay);
    return () => clearTimeout(t);
  }, [cityId, phase, spawn]);

  useEffect(() => {
    if (phase !== 'invaded') return;
    const id = setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setPhase('dormant');
          setArenaOpen(false);
          progressRef.current = 0;
          setProgress(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'invaded' || !city) return;
    const room = getChannel(city.channel);
    if (!room) return;

    for (const msg of room.messages) {
      if (processedRef.current.has(msg.id)) continue;
      if (msg.type !== 'chat' && msg.type !== 'action') continue;
      processedRef.current.add(msg.id);

      const expected = BANISH_SEQUENCE[progressRef.current];
      if (!expected || !matchesSequenceStep(msg.text, expected)) continue;

      const who = msg.nick ?? '?';
      progressRef.current += 1;
      setProgress(progressRef.current);
      if (!helpersRef.current.includes(who)) {
        helpersRef.current = [...helpersRef.current, who];
        setHelpers(helpersRef.current);
      }
      if (progressRef.current >= BANISH_SEQUENCE.length) banish();
    }
  }, [phase, city, getChannel, banish]);

  const contributeLetter = useCallback(
    (letter: string) => {
      if (city && phase === 'invaded') sendChannel(city.channel, letter);
    },
    [city, phase, sendChannel],
  );

  const value = useMemo(
    () => ({
      phase,
      secLeft,
      progress,
      spawnLine,
      taunt,
      helpers,
      banishesTotal,
      oracle,
      arenaOpen,
      openArena: () => setArenaOpen(true),
      closeArena: () => setArenaOpen(false),
      contributeLetter,
      cityName,
      nick,
      sequence: BANISH_SEQUENCE,
    }),
    [
      phase,
      secLeft,
      progress,
      spawnLine,
      taunt,
      helpers,
      banishesTotal,
      oracle,
      arenaOpen,
      contributeLetter,
      cityName,
      nick,
    ],
  );

  return <GlitchPigContext.Provider value={value}>{children}</GlitchPigContext.Provider>;
}

export function useGlitchPig() {
  const ctx = useContext(GlitchPigContext);
  if (!ctx) throw new Error('useGlitchPig must be used within GlitchPigProvider');
  return ctx;
}
