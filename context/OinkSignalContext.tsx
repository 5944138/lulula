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

import { WS_URL } from '@/constants/config';
import type { SenalResult, SignalPhase, TopWord } from '@/constants/senal';
import { STORAGE_KEYS } from '@/constants/storage';

type SignalContextValue = {
  nick: string;
  nickReady: boolean;
  connected: boolean;
  phase: SignalPhase;
  secondsToSignal: number;
  secondsLeft: number;
  livePlayers: number;
  question: string;
  signalDate: string;
  yourWord: string | null;
  yourWordCount: number;
  topWords: TopWord[];
  winningWord: string | null;
  winningCount: number;
  totalPlayers: number;
  yesterday: SenalResult | null;
  today: SenalResult | null;
  testMode: boolean;
  error: string | null;
  setNick: (nick: string) => Promise<void>;
  submitWord: (word: string) => void;
};

const SignalContext = createContext<SignalContextValue | null>(null);

export function SignalProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const nickRef = useRef('');

  const [nick, setNickState] = useState('');
  const [nickReady, setNickReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState<SignalPhase>('countdown');
  const [secondsToSignal, setSecondsToSignal] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [livePlayers, setLivePlayers] = useState(0);
  const [question, setQuestion] = useState('');
  const [signalDate, setSignalDate] = useState('');
  const [yourWord, setYourWord] = useState<string | null>(null);
  const [yourWordCount, setYourWordCount] = useState(0);
  const [topWords, setTopWords] = useState<TopWord[]>([]);
  const [winningWord, setWinningWord] = useState<string | null>(null);
  const [winningCount, setWinningCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [yesterday, setYesterday] = useState<SenalResult | null>(null);
  const [today, setToday] = useState<SenalResult | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyReveal = useCallback((msg: Record<string, unknown>) => {
    setPhase('reveal');
    setQuestion(String(msg.question ?? ''));
    setSignalDate(String(msg.fecha ?? ''));
    setTopWords((msg.topWords as TopWord[]) ?? []);
    setWinningWord((msg.winningWord as string) ?? null);
    setWinningCount(Number(msg.winningCount ?? 0));
    setTotalPlayers(Number(msg.totalPlayers ?? 0));
    setYourWord((msg.yourWord as string) ?? null);
    setYourWordCount(Number(msg.yourWordCount ?? 0));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      if (nickRef.current) {
        ws.send(JSON.stringify({ type: 'join', nick: nickRef.current }));
      }
    };

    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }

      if (msg.type === 'state') {
        setPhase(msg.phase as SignalPhase);
        setSecondsToSignal(Number(msg.secondsToSignal ?? 0));
        setSecondsLeft(Number(msg.secondsLeft ?? 0));
        setLivePlayers(Number(msg.livePlayers ?? 0));
        if (msg.question) setQuestion(String(msg.question));
        if (msg.signalDate) setSignalDate(String(msg.signalDate));
        setYesterday((msg.yesterday as SenalResult) ?? null);
        setToday((msg.today as SenalResult) ?? null);
        setTestMode(Boolean(msg.testMode));
        if (msg.phase === 'live' || msg.phase === 'aviso') {
          setYourWord(null);
          setYourWordCount(0);
        }
        if (msg.phase === 'resultado' && msg.today) {
          const t = msg.today as SenalResult;
          setWinningWord(t.winningWord);
          setWinningCount(t.winningCount);
          setTopWords(t.topWords);
          setTotalPlayers(t.totalPlayers);
          setQuestion(t.question);
        }
      }

      if (msg.type === 'reveal') {
        applyReveal(msg);
        setPhase('reveal');
        setSecondsLeft(Number(msg.secondsLeft ?? 0));
      }

      if (msg.type === 'ack') {
        setYourWord(String(msg.word));
        setError(null);
      }

      if (msg.type === 'joined') {
        setNickState(String(msg.nick));
      }

      if (msg.type === 'error') {
        setError(String(msg.message));
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();
  }, [applyReveal]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.nick).then((v) => {
      if (v) {
        nickRef.current = v;
        setNickState(v);
        setNickReady(true);
      }
      connect();
    });
    return () => wsRef.current?.close();
  }, [connect]);

  const setNick = useCallback(async (value: string) => {
    const clean = value.trim().slice(0, 24);
    if (clean.length < 2) {
      setError('Escribe al menos 2 letras');
      return;
    }
    nickRef.current = clean;
    setNickState(clean);
    setNickReady(true);
    await AsyncStorage.setItem(STORAGE_KEYS.nick, clean);
    wsRef.current?.send(JSON.stringify({ type: 'join', nick: clean }));
    setError(null);
  }, []);

  const submitWord = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    wsRef.current?.send(JSON.stringify({ type: 'submit', word }));
  }, []);

  const value = useMemo(
    (): SignalContextValue => ({
      nick,
      nickReady,
      connected,
      phase,
      secondsToSignal,
      secondsLeft,
      livePlayers,
      question,
      signalDate,
      yourWord,
      yourWordCount,
      topWords,
      winningWord,
      winningCount,
      totalPlayers,
      yesterday,
      today,
      testMode,
      error,
      setNick,
      submitWord,
    }),
    [
      nick,
      nickReady,
      connected,
      phase,
      secondsToSignal,
      secondsLeft,
      livePlayers,
      question,
      signalDate,
      yourWord,
      yourWordCount,
      topWords,
      winningWord,
      winningCount,
      totalPlayers,
      yesterday,
      today,
      testMode,
      error,
      setNick,
      submitWord,
    ],
  );

  return <SignalContext.Provider value={value}>{children}</SignalContext.Provider>;
}

export function useSignal() {
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error('useSignal within SignalProvider');
  return ctx;
}
