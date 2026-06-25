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
  COUNTDOWN_SEC,
  getWaveSchedule,
  pickWaveChallenge,
  type WaveChallenge,
  type WavePhase,
} from '@/constants/oinkWave';
import { CITY_RIVALS, getCity, type CityId } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useGamification } from '@/context/GamificationContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';
import type { IRCMessage } from '@/lib/irc/types';

export type WaveResult = {
  playerScore: number;
  cityScore: number;
  rivalScore: number;
  rivalName: string;
  cityWon: boolean;
  rank: number;
  coinsEarned: number;
};

type OinkWaveContextValue = {
  phase: WavePhase;
  challenge: WaveChallenge | null;
  countdownSec: number;
  liveSecLeft: number;
  isMega: boolean;
  playerScore: number;
  cityScore: number;
  liveFeed: string[];
  result: WaveResult | null;
  wavesPlayed: number;
  arenaOpen: boolean;
  cityName: string;
  enterArena: () => void;
  dismissResults: () => void;
  submitFromArena: (text: string) => void;
};

const OinkWaveContext = createContext<OinkWaveContextValue | null>(null);

function scoreMessage(msg: IRCMessage, challenge: WaveChallenge, alreadyEmojiHit: boolean): number {
  const text = msg.text.trim();
  const lower = text.toLowerCase();
  switch (challenge.type) {
    case 'emoji_storm':
      if (alreadyEmojiHit) return 0;
      return challenge.targetEmoji && text.includes(challenge.targetEmoji) ? 100 : 0;
    case 'oink_flood':
      return lower.includes('oink') || text.includes('🐷') ? 12 : 0;
    case 'phrase_lock':
      return lower === challenge.targetPhrase?.toLowerCase() ? 200 : 0;
    case 'city_siege':
      return msg.type === 'chat' || msg.type === 'action' ? 8 : 0;
    default:
      return 0;
  }
}

function simulateRivalScore(rivalId: CityId, slot: number, score: number): number {
  const base = 40 + (Math.abs(slot * 7919 + rivalId.length * 313) % 120);
  return Math.max(base, Math.floor(score * (0.75 + (slot % 5) * 0.06)));
}

export function OinkWaveProvider({ children }: { children: ReactNode }) {
  const { cityId, cityName } = useIdentity();
  const { getChannel, sendChannel, joinChannel } = useIRC();
  const { grantCoins } = useEconomy();
  const { recordMessage } = useGamification();

  const [phase, setPhase] = useState<WavePhase>('idle');
  const [challenge, setChallenge] = useState<WaveChallenge | null>(null);
  const [countdownSec, setCountdownSec] = useState(0);
  const [liveSecLeft, setLiveSecLeft] = useState(0);
  const [isMega, setIsMega] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [cityScore, setCityScore] = useState(0);
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [result, setResult] = useState<WaveResult | null>(null);
  const [wavesPlayed, setWavesPlayed] = useState(0);
  const [arenaOpen, setArenaOpen] = useState(false);

  const slotRef = useRef(0);
  const emojiHitRef = useRef(false);
  const processedIdsRef = useRef(new Set<string>());
  const cityChannelRef = useRef<string | null>(null);

  const city = cityId ? getCity(cityId) : null;
  const rivalId = cityId ? CITY_RIVALS[cityId] : undefined;
  const rival = rivalId ? getCity(rivalId) : null;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.oinkWavesPlayed).then((v) => {
      if (v) setWavesPlayed(Number(v) || 0);
    });
  }, []);

  const finishWave = useCallback(() => {
    if (!challenge || !city) return;
    const rivalName = rival?.name ?? 'Internet';
    const rivalScore = simulateRivalScore(rival?.id ?? 'tokyo', slotRef.current, cityScore);
    const cityWon = cityScore >= rivalScore;
    const rank = playerScore >= 100 ? 1 : playerScore >= 50 ? 2 : playerScore >= 20 ? 3 : 5;
    const coinsEarned = (cityWon ? 40 : 15) + Math.floor(playerScore / 10) + (isMega ? 30 : 0);
    grantCoins(coinsEarned);
    setResult({
      playerScore,
      cityScore,
      rivalScore,
      rivalName,
      cityWon,
      rank,
      coinsEarned,
    });
    setPhase('results');
    setArenaOpen(true);
    const played = wavesPlayed + 1;
    setWavesPlayed(played);
    AsyncStorage.setItem(STORAGE_KEYS.oinkWavesPlayed, String(played));
  }, [challenge, city, rival, cityScore, playerScore, isMega, grantCoins, wavesPlayed]);

  const startLive = useCallback(
    (ch: WaveChallenge, mega: boolean, slot: number) => {
      slotRef.current = slot;
      emojiHitRef.current = false;
      processedIdsRef.current.clear();
      setChallenge(ch);
      setIsMega(mega);
      setPlayerScore(0);
      setCityScore(0);
      setLiveFeed([]);
      setResult(null);
      setLiveSecLeft(ch.durationSec);
      setPhase('live');
      setArenaOpen(true);
      if (city) {
        cityChannelRef.current = city.channel;
        joinChannel(city.channel);
        setLiveFeed([`⚡ OINK WAVE — ${ch.title}`, `📡 ${city.channel}`, ch.instruction]);
      }
    },
    [city, joinChannel],
  );

  useEffect(() => {
    const tick = () => {
      const { slot, msUntilNext, isMega: mega } = getWaveSchedule();
      if (phase === 'live' || phase === 'results') return;

      if (msUntilNext <= COUNTDOWN_SEC * 1000) {
        const secLeft = Math.ceil(msUntilNext / 1000);
        if (phase !== 'countdown') {
          setChallenge(pickWaveChallenge(slot));
          setIsMega(mega);
          setPhase('countdown');
        }
        setCountdownSec(secLeft);
        if (secLeft <= 1) {
          startLive(pickWaveChallenge(slot), mega, slot);
        }
      } else if (phase === 'countdown') {
        setPhase('idle');
        setCountdownSec(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, startLive]);

  useEffect(() => {
    if (phase !== 'live' || !challenge) return;
    const id = setInterval(() => {
      setLiveSecLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(finishWave, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, challenge, finishWave]);

  useEffect(() => {
    if (phase !== 'live' || !challenge || !city) return;
    const room = getChannel(city.channel);
    if (!room) return;

    for (const msg of room.messages) {
      if (processedIdsRef.current.has(msg.id)) continue;
      processedIdsRef.current.add(msg.id);
      if (msg.type !== 'chat' && msg.type !== 'action') continue;

      const pts = scoreMessage(msg, challenge, emojiHitRef.current);
      if (pts <= 0) continue;

      if (challenge.type === 'emoji_storm') emojiHitRef.current = true;

      const label = msg.fromMe ? 'Tú' : msg.nick ?? '?';
      setLiveFeed((f) => [`${label}: ${msg.text.slice(0, 40)} +${pts}`, ...f].slice(0, 12));

      if (msg.fromMe) setPlayerScore((p) => p + pts);
      setCityScore((c) => c + pts);
    }
  }, [phase, challenge, city, getChannel]);

  const submitFromArena = useCallback(
    (text: string) => {
      const ch = cityChannelRef.current;
      if (!ch || phase !== 'live') return;
      sendChannel(ch, text);
      recordMessage();
    },
    [phase, sendChannel, recordMessage],
  );

  const value = useMemo(
    () => ({
      phase,
      challenge,
      countdownSec,
      liveSecLeft,
      isMega,
      playerScore,
      cityScore,
      liveFeed,
      result,
      wavesPlayed,
      arenaOpen,
      cityName,
      enterArena: () => setArenaOpen(true),
      dismissResults: () => {
        setArenaOpen(false);
        setPhase('idle');
        setResult(null);
        setChallenge(null);
      },
      submitFromArena,
    }),
    [
      phase,
      challenge,
      countdownSec,
      liveSecLeft,
      isMega,
      playerScore,
      cityScore,
      liveFeed,
      result,
      wavesPlayed,
      arenaOpen,
      cityName,
      submitFromArena,
    ],
  );

  return <OinkWaveContext.Provider value={value}>{children}</OinkWaveContext.Provider>;
}

export function useOinkWave() {
  const ctx = useContext(OinkWaveContext);
  if (!ctx) throw new Error('useOinkWave must be used within OinkWaveProvider');
  return ctx;
}
