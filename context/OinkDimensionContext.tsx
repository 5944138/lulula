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
  countFilled,
  emptyGrid,
  messageToCell,
  paintOnGrid,
  type CanvasGrid,
} from '@/constants/oinkDimension';
import { getPossessionLine, WIRE_LEGENDS, type LegendChapter } from '@/constants/wireLegends';
import { getCity } from '@/constants/world';
import { STORAGE_KEYS } from '@/constants/storage';
import { useEconomy } from '@/context/EconomyContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

type PossessionState = {
  active: boolean;
  line: string;
  secLeft: number;
  banishCount: number;
};

type DimensionContextValue = {
  grid: CanvasGrid;
  filled: number;
  cityMessagesToday: number;
  unlockedChapters: LegendChapter[];
  activeChapter: LegendChapter | null;
  possession: PossessionState;
  banishPossession: () => void;
  loadGrid: () => Promise<void>;
  cityName: string;
};

const DimensionContext = createContext<DimensionContextValue | null>(null);

function todayKey(cityId: string) {
  return `${new Date().toISOString().slice(0, 10)}_${cityId}`;
}

export function OinkDimensionProvider({ children }: { children: ReactNode }) {
  const { cityId, cityName } = useIdentity();
  const { getChannel, sendChannel } = useIRC();
  const { grantCoins } = useEconomy();

  const [grid, setGrid] = useState<CanvasGrid>(emptyGrid);
  const [cityMessagesToday, setCityMessagesToday] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [possession, setPossession] = useState<PossessionState>({
    active: false,
    line: '',
    secLeft: 0,
    banishCount: 0,
  });

  const processedRef = useRef(new Set<string>());
  const rewardedRef = useRef(new Set<number>());

  const loadGrid = useCallback(async () => {
    if (!cityId) return;
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.oinkCanvas}/${todayKey(cityId)}`);
    if (raw) {
      try {
        setGrid(JSON.parse(raw));
      } catch {
        setGrid(emptyGrid());
      }
    }
    const legends = await AsyncStorage.getItem(STORAGE_KEYS.wireLegends);
    if (legends) setUnlockedIds(JSON.parse(legends));
    const count = await AsyncStorage.getItem(`${STORAGE_KEYS.cityMsgCount}/${todayKey(cityId)}`);
    if (count) setCityMessagesToday(Number(count) || 0);
  }, [cityId]);

  useEffect(() => {
    loadGrid();
  }, [loadGrid]);

  useEffect(() => {
    if (!cityId) return;
    const city = getCity(cityId);
    const room = getChannel(city.channel);
    if (!room) return;

    let newMsgs = 0;
    for (const msg of room.messages) {
      if (processedRef.current.has(msg.id)) continue;
      if (msg.type !== 'chat' && msg.type !== 'action') continue;
      processedRef.current.add(msg.id);

      const { x, y, cell } = messageToCell(msg.id, msg.nick ?? '?', msg.text);
      setGrid((g) => paintOnGrid(g, x, y, cell));
      newMsgs += 1;

      if (msg.text.includes('🐷') && possession.active) {
        setPossession((p) => ({ ...p, banishCount: p.banishCount + 1 }));
      }
    }

    if (newMsgs > 0) {
      setCityMessagesToday((c) => {
        const next = c + newMsgs;
        AsyncStorage.setItem(`${STORAGE_KEYS.cityMsgCount}/${todayKey(cityId)}`, String(next));
        return next;
      });
    }
  }, [cityId, getChannel, possession.active]);

  useEffect(() => {
    if (!cityId || countFilled(grid) === 0) return;
    AsyncStorage.setItem(`${STORAGE_KEYS.oinkCanvas}/${todayKey(cityId)}`, JSON.stringify(grid));
  }, [grid, cityId]);

  useEffect(() => {
    if (!cityId) return;
    for (const ch of WIRE_LEGENDS) {
      if (cityMessagesToday >= ch.threshold && !unlockedIds.includes(ch.id) && !rewardedRef.current.has(ch.id)) {
        rewardedRef.current.add(ch.id);
        setUnlockedIds((ids) => {
          const next = [...ids, ch.id];
          AsyncStorage.setItem(STORAGE_KEYS.wireLegends, JSON.stringify(next));
          return next;
        });
        grantCoins(20 + ch.id * 5);
      }
    }
  }, [cityMessagesToday, unlockedIds, cityId, grantCoins]);

  useEffect(() => {
    if (!cityId) return;
    const delay = 120_000 + Math.random() * 180_000;
    const t = setTimeout(() => {
      setPossession({
        active: true,
        line: getPossessionLine(Date.now()),
        secLeft: 90,
        banishCount: 0,
      });
    }, delay);
    return () => clearTimeout(t);
  }, [cityId]);

  useEffect(() => {
    if (!possession.active) return;
    const id = setInterval(() => {
      setPossession((p) => {
        if (p.secLeft <= 1) return { active: false, line: '', secLeft: 0, banishCount: 0 };
        return { ...p, secLeft: p.secLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [possession.active]);

  const banishPossession = useCallback(() => {
    if (!cityId) return;
    const city = getCity(cityId);
    sendChannel(city.channel, '🐷 Lulula liberada — oink banish');
    setPossession({ active: false, line: '', secLeft: 0, banishCount: 0 });
    grantCoins(15);
  }, [cityId, sendChannel, grantCoins]);

  const unlockedChapters = WIRE_LEGENDS.filter((c) => unlockedIds.includes(c.id));
  const activeChapter =
    [...WIRE_LEGENDS].reverse().find((c) => unlockedIds.includes(c.id)) ?? WIRE_LEGENDS[0];

  const value = useMemo(
    () => ({
      grid,
      filled: countFilled(grid),
      cityMessagesToday,
      unlockedChapters,
      activeChapter: cityMessagesToday >= WIRE_LEGENDS[0].threshold ? activeChapter : null,
      possession,
      banishPossession,
      loadGrid,
      cityName,
    }),
    [
      grid,
      cityMessagesToday,
      unlockedChapters,
      activeChapter,
      possession,
      banishPossession,
      loadGrid,
      cityName,
    ],
  );

  return <DimensionContext.Provider value={value}>{children}</DimensionContext.Provider>;
}

export function useOinkDimension() {
  const ctx = useContext(DimensionContext);
  if (!ctx) throw new Error('useOinkDimension must be used within OinkDimensionProvider');
  return ctx;
}
