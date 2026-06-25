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
  CYCLE_MS,
  DESEO_CMD_MULTIPLIER,
  getDesire,
  getMindPhase,
  getWorldDesireSlot,
  msUntilNextWhisper,
  msUntilResonanceEnd,
  parseDeseoCommand,
  pickConfession,
  RESONANCE_GOAL,
  RESONANCE_SHARE,
  RESONANCE_WINDOW_SEC,
  scoreMessageForDesire,
  simulateRivalProgress,
  simulateWorldSouls,
  WHISPER_SEC,
  type Desire,
  type DesireId,
  type MindPhase,
} from '@/constants/collectiveMind';
import { CITY_RIVALS, getCity, type CityId } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useGamification } from '@/context/GamificationContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

export type ResonanceResult = {
  desire: Desire;
  confession: string;
  coins: number;
  mega: boolean;
  contributors: number;
  rivalBeat: boolean;
  rivalName: string;
};

type CollectiveMindContextValue = {
  phase: MindPhase;
  desire: Desire;
  mega: boolean;
  progress: number;
  rivalProgress: number;
  rivalName: string;
  secLeft: number;
  whisperSecLeft: number;
  worldSouls: number;
  streak: number;
  resonancesTotal: number;
  personalContribution: number;
  lululaWhisper: string;
  confessionWall: string[];
  result: ResonanceResult | null;
  arenaOpen: boolean;
  openArena: () => void;
  closeArena: () => void;
  dismissCelebration: () => void;
  submitDesire: (text: string) => void;
  cityName: string;
};

const CollectiveMindContext = createContext<CollectiveMindContextValue | null>(null);

export function CollectiveMindProvider({ children }: { children: ReactNode }) {
  const { cityId, cityName } = useIdentity();
  const { nick, getChannel, sendChannel } = useIRC();
  const { grantCoins } = useEconomy();
  const { recordMessage } = useGamification();

  const [phase, setPhase] = useState<MindPhase>('idle');
  const [desireId, setDesireId] = useState<DesireId>('conexion');
  const [mega, setMega] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rivalProgress, setRivalProgress] = useState(0);
  const [secLeft, setSecLeft] = useState(0);
  const [whisperSecLeft, setWhisperSecLeft] = useState(0);
  const [worldSouls, setWorldSouls] = useState(0);
  const [streak, setStreak] = useState(0);
  const [resonancesTotal, setResonancesTotal] = useState(0);
  const [personalContribution, setPersonalContribution] = useState(0);
  const [confessionWall, setConfessionWall] = useState<string[]>([]);
  const [result, setResult] = useState<ResonanceResult | null>(null);
  const [arenaOpen, setArenaOpen] = useState(false);

  const progressRef = useRef(0);
  const personalRef = useRef(0);
  const contributorsRef = useRef(new Set<string>());
  const processedRef = useRef(new Set<string>());
  const slotRef = useRef(0);
  const triggeredRef = useRef(false);
  const windowStartRef = useRef(0);
  const streakRef = useRef(0);
  const resonancesRef = useRef(0);
  const confessionWallRef = useRef<string[]>([]);

  const city = cityId ? getCity(cityId) : null;
  const desire = useMemo(() => getDesire(desireId), [desireId]);
  const rivalId = cityId ? CITY_RIVALS[cityId] : undefined;
  const rival = rivalId ? getCity(rivalId) : null;
  const rivalName = rival?.name ?? 'Rival';

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);
  useEffect(() => {
    resonancesRef.current = resonancesTotal;
  }, [resonancesTotal]);
  useEffect(() => {
    confessionWallRef.current = confessionWall;
  }, [confessionWall]);

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.mindStreak, STORAGE_KEYS.mindResonances, STORAGE_KEYS.mindConfessions]).then(
      ([s, r, c]) => {
        if (s[1]) setStreak(Number(s[1]) || 0);
        if (r[1]) setResonancesTotal(Number(r[1]) || 0);
        if (c[1]) {
          try {
            setConfessionWall(JSON.parse(c[1]));
          } catch {
            /* noop */
          }
        }
      },
    );
  }, []);

  const triggerResonance = useCallback(() => {
    const elapsed = windowStartRef.current ? (Date.now() - windowStartRef.current) / 1000 : 45;
    const rivalProg = simulateRivalProgress(rivalName, slotRef.current, elapsed);
    const rivalBeat = rivalProg >= RESONANCE_GOAL && elapsed > RESONANCE_WINDOW_SEC * 0.55;

    const currentDesire = getDesire(desireId);
    const confession = pickConfession(currentDesire, cityName || 'tu ciudad');
    const isMega = getWorldDesireSlot().mega;
    const baseCoins = isMega ? 80 : 35;
    const streakBonus = Math.min(streakRef.current * 5, 40);
    const coins = baseCoins + streakBonus + contributorsRef.current.size * 3;

    const newStreak = rivalBeat ? 0 : streakRef.current + 1;
    const newTotal = resonancesRef.current + 1;

    setStreak(newStreak);
    setResonancesTotal(newTotal);
    setPhase('celebration');
    setArenaOpen(true);
    setResult({
      desire: currentDesire,
      confession,
      coins,
      mega: isMega,
      contributors: contributorsRef.current.size,
      rivalBeat,
      rivalName,
    });

    grantCoins(coins);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const wall = [confession, ...confessionWallRef.current].slice(0, 8);
    setConfessionWall(wall);

    AsyncStorage.multiSet([
      [STORAGE_KEYS.mindStreak, String(newStreak)],
      [STORAGE_KEYS.mindResonances, String(newTotal)],
      [STORAGE_KEYS.mindConfessions, JSON.stringify(wall)],
    ]);

    if (city) {
      const tag = isMega ? '⚡ MEGA RESONANCIA' : '🌍 RESONANCIA';
      sendChannel(
        city.channel,
        `${tag} · La mente colectiva pidió ${currentDesire.emoji} ${currentDesire.label} — ${cityName} respondió. ${confession}`,
      );
    }
  }, [city, cityName, desireId, grantCoins, rivalName, sendChannel]);

  const addContribution = useCallback(
    (points: number, fromNick: string) => {
      if (phase !== 'active' && phase !== 'whisper') return;
      if (points <= 0) return;

      contributorsRef.current.add(fromNick);
      if (fromNick === nick) {
        personalRef.current += points;
        setPersonalContribution(personalRef.current);
      }

      const next = Math.min(RESONANCE_GOAL, progressRef.current + points);
      progressRef.current = next;
      setProgress(next);

      if (next >= RESONANCE_GOAL && !triggeredRef.current) {
        triggeredRef.current = true;
        triggerResonance();
      }
    },
    [phase, nick, triggerResonance],
  );

  // Tick del ciclo mundial
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const { slot, desireId: dId, mega: isMega } = getWorldDesireSlot(now);
      const mindPhase = getMindPhase(now);

      if (slot !== slotRef.current) {
        slotRef.current = slot;
        progressRef.current = 0;
        personalRef.current = 0;
        contributorsRef.current = new Set();
        processedRef.current = new Set();
        triggeredRef.current = false;
        windowStartRef.current = 0;
        setProgress(0);
        setPersonalContribution(0);
        if (phase !== 'celebration') {
          setResult(null);
          setPhase(mindPhase);
        }
      }

      setDesireId(dId);
      setMega(isMega);
      setWorldSouls(simulateWorldSouls(slot));

      const whisperMs = msUntilNextWhisper(now);
      setWhisperSecLeft(Math.ceil(whisperMs / 1000));

      if (mindPhase === 'whisper' || mindPhase === 'active') {
        if (phase !== 'celebration') setPhase(mindPhase);
        const resMs = msUntilResonanceEnd(now);
        setSecLeft(Math.ceil(resMs / 1000));

        if (mindPhase === 'active' && windowStartRef.current === 0) {
          windowStartRef.current = now - (RESONANCE_WINDOW_SEC * 1000 - resMs);
        }

        const cycleStart = now - (now % CYCLE_MS);
        const activeStart = cycleStart + (CYCLE_MS - (WHISPER_SEC + RESONANCE_WINDOW_SEC) * 1000);
        const elapsed = Math.max(0, (now - activeStart) / 1000);
        setRivalProgress(simulateRivalProgress(rivalName, slot, elapsed));
      } else if (phase !== 'celebration') {
        setPhase('idle');
        setSecLeft(0);
        windowStartRef.current = 0;
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, rivalName]);

  // Escuchar IRC de la ciudad
  useEffect(() => {
    if (!city) return;
    const room = getChannel(city.channel);
    if (!room) return;

    for (const msg of room.messages) {
      const key = `${msg.time}-${msg.nick}-${msg.text}`;
      if (processedRef.current.has(key)) continue;
      processedRef.current.add(key);

      if (phase !== 'active' && phase !== 'whisper') continue;

      const deseoWord = parseDeseoCommand(msg.text);
      if (deseoWord) {
        const pts = scoreMessageForDesire(deseoWord, desire) * DESEO_CMD_MULTIPLIER || 18;
        addContribution(pts, msg.nick ?? 'anon');
        continue;
      }

      const pts = scoreMessageForDesire(msg.text, desire);
      if (pts > 0) addContribution(pts, msg.nick ?? 'anon');
    }
  }, [addContribution, city, desire, getChannel, phase]);

  const lululaWhisper = useMemo(() => {
    if (phase === 'whisper') return desire.whisper;
    if (phase === 'active' && progress >= RESONANCE_GOAL * 0.75) {
      return `Casi… el mundo pide ${desire.emoji} ${desire.label}. Escribe "${desire.mantra}" o /deseo ${desire.keywords[0]}`;
    }
    if (phase === 'active') {
      return `${rivalName} va ${rivalProgress}/${RESONANCE_GOAL}. Tu ciudad ${progress}/${RESONANCE_GOAL}. ¡Habla en IRC!`;
    }
    const nextMin = Math.ceil(msUntilNextWhisper() / 60000);
    return nextMin > 0
      ? `La mente colectiva despierta en ~${nextMin} min. ${worldSouls.toLocaleString()} almas conectadas.`
      : desire.whisper;
  }, [desire, phase, progress, rivalName, rivalProgress, worldSouls]);

  const submitDesire = useCallback(
    (text: string) => {
      const deseoWord = parseDeseoCommand(text);
      const body = deseoWord ?? text;
      const mult = deseoWord ? DESEO_CMD_MULTIPLIER : 1;
      const pts = scoreMessageForDesire(body, desire) * mult || (deseoWord ? 18 : 8);
      addContribution(pts, nick);
      recordMessage();
      if (city) {
        const cmd = deseoWord ? `/deseo ${deseoWord}` : text;
        sendChannel(city.channel, cmd);
      }
    },
    [addContribution, city, desire, nick, recordMessage, sendChannel],
  );

  const value = useMemo(
    (): CollectiveMindContextValue => ({
      phase,
      desire,
      mega,
      progress,
      rivalProgress,
      rivalName,
      secLeft,
      whisperSecLeft,
      worldSouls,
      streak,
      resonancesTotal,
      personalContribution,
      lululaWhisper,
      confessionWall,
      result,
      arenaOpen,
      openArena: () => setArenaOpen(true),
      closeArena: () => setArenaOpen(false),
      dismissCelebration: () => {
        setResult(null);
        setPhase(getMindPhase());
        setArenaOpen(false);
      },
      submitDesire,
      cityName: cityName || '',
    }),
    [
      arenaOpen,
      confessionWall,
      desire,
      lululaWhisper,
      mega,
      personalContribution,
      phase,
      progress,
      result,
      resonancesTotal,
      rivalName,
      rivalProgress,
      secLeft,
      streak,
      submitDesire,
      whisperSecLeft,
      worldSouls,
      cityName,
    ],
  );

  return <CollectiveMindContext.Provider value={value}>{children}</CollectiveMindContext.Provider>;
}

export function useCollectiveMind() {
  const ctx = useContext(CollectiveMindContext);
  if (!ctx) throw new Error('useCollectiveMind must be used within CollectiveMindProvider');
  return ctx;
}
