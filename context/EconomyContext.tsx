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

import type { ViralGameId } from '@/constants/games/catalog';
import {
  AD_REWARD_COINS,
  COSMETICS,
  DAILY_FREE_PEARLS,
  GAME_PASSES,
  REVIVE_COST_PEARLS,
  type ShopProduct,
} from '@/constants/games/monetization';
import { STORAGE_KEYS } from '@/constants/storage';

const ECONOMY_KEY = '@lulula/economy';

type EconomyState = {
  oinkCoins: number;
  pearls: number;
  revives: number;
  craftEnergy: number;
  ownedCosmetics: string[];
  activeGamePasses: ViralGameId[];
  battlePassActive: boolean;
  lastDailyPearl: string;
  adsWatchedToday: number;
};

const DEFAULT: EconomyState = {
  oinkCoins: 200,
  pearls: 15,
  revives: 1,
  craftEnergy: 40,
  ownedCosmetics: ['skin-default'],
  activeGamePasses: [],
  battlePassActive: false,
  lastDailyPearl: '',
  adsWatchedToday: 0,
};

type EconomyContextValue = EconomyState & {
  ready: boolean;
  equippedSkin: string;
  purchaseProduct: (product: ShopProduct) => Promise<boolean>;
  buyCosmetic: (id: string) => Promise<boolean>;
  buyGamePass: (gameId: ViralGameId) => Promise<boolean>;
  spendRevive: () => boolean;
  spendCraftEnergy: (n?: number) => boolean;
  grantCoins: (amount: number, gameId?: ViralGameId) => void;
  grantPearls: (amount: number) => void;
  grantRevives: (n: number) => void;
  refillCraftEnergy: (n: number) => void;
  watchAdReward: () => boolean;
  claimDailyPearls: () => boolean;
  coinMultiplier: (gameId?: ViralGameId) => number;
  hasGamePass: (gameId: ViralGameId) => boolean;
  equipCosmetic: (id: string) => void;
};

const EconomyContext = createContext<EconomyContextValue | null>(null);

async function loadEconomy(): Promise<EconomyState> {
  try {
    const raw = await AsyncStorage.getItem(ECONOMY_KEY);
    if (!raw) {
      const legacy = await AsyncStorage.getItem('@lolaphone/economy');
      if (legacy) {
        await AsyncStorage.setItem(ECONOMY_KEY, legacy);
        return { ...DEFAULT, ...JSON.parse(legacy) };
      }
    }
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

async function saveEconomy(s: EconomyState) {
  await AsyncStorage.setItem(ECONOMY_KEY, JSON.stringify(s));
}

export function EconomyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EconomyState>(DEFAULT);
  const [ready, setReady] = useState(false);
  const [equippedSkin, setEquippedSkin] = useState('skin-default');

  useEffect(() => {
    loadEconomy().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: EconomyState) => {
    setState(next);
    saveEconomy(next);
  }, []);

  const hasGamePass = useCallback(
    (gameId: ViralGameId) => state.activeGamePasses.includes(gameId) || state.battlePassActive,
    [state.activeGamePasses, state.battlePassActive],
  );

  const coinMultiplier = useCallback(
    (gameId?: ViralGameId) => {
      let m = 1;
      if (state.battlePassActive) m = 2;
      if (gameId && state.activeGamePasses.includes(gameId)) m = Math.max(m, 2);
      return m;
    },
    [state.activeGamePasses, state.battlePassActive],
  );

  const grantCoins = useCallback(
    (amount: number, gameId?: ViralGameId) => {
      const mult = coinMultiplier(gameId);
      persist({ ...state, oinkCoins: state.oinkCoins + Math.round(amount * mult) });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [state, persist, coinMultiplier],
  );

  const grantPearls = useCallback(
    (amount: number) => persist({ ...state, pearls: state.pearls + amount }),
    [state, persist],
  );

  const grantRevives = useCallback(
    (n: number) => persist({ ...state, revives: state.revives + n }),
    [state, persist],
  );

  const refillCraftEnergy = useCallback(
    (n: number) => persist({ ...state, craftEnergy: state.craftEnergy + n }),
    [state, persist],
  );

  const purchaseProduct = useCallback(
    async (product: ShopProduct): Promise<boolean> => {
      let next = { ...state };
      if (product.pricePearls && next.pearls < product.pricePearls) return false;
      if (product.priceCoins && next.oinkCoins < product.priceCoins) return false;

      if (product.pricePearls) next.pearls -= product.pricePearls;
      if (product.priceCoins) next.oinkCoins -= product.priceCoins;
      if (product.grantPearls) next.pearls += product.grantPearls;
      if (product.grantCoins) next.oinkCoins += product.grantCoins;
      if (product.id === 'revive-3') next.revives += 3;
      if (product.id === 'energy-refill') next.craftEnergy += 50;
      if (product.id === 'battle-pass-s1') next.battlePassActive = true;

      persist(next);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    },
    [state, persist],
  );

  const buyCosmetic = useCallback(
    async (id: string): Promise<boolean> => {
      const item = COSMETICS.find((c) => c.id === id);
      if (!item || state.ownedCosmetics.includes(id)) return false;
      if (item.pricePearls && state.pearls < item.pricePearls) return false;
      if (item.priceCoins && state.oinkCoins < item.priceCoins) return false;

      persist({
        ...state,
        pearls: item.pricePearls ? state.pearls - item.pricePearls : state.pearls,
        oinkCoins: item.priceCoins ? state.oinkCoins - item.priceCoins : state.oinkCoins,
        ownedCosmetics: [...state.ownedCosmetics, id],
      });
      if (item.slot === 'skin') setEquippedSkin(id);
      return true;
    },
    [state, persist],
  );

  const buyGamePass = useCallback(
    async (gameId: ViralGameId): Promise<boolean> => {
      const pass = GAME_PASSES.find((p) => p.gameId === gameId);
      if (!pass || state.pearls < pass.pricePearls) return false;
      if (state.activeGamePasses.includes(gameId)) return true;

      persist({
        ...state,
        pearls: state.pearls - pass.pricePearls,
        activeGamePasses: [...state.activeGamePasses, gameId],
      });
      return true;
    },
    [state, persist],
  );

  const spendRevive = useCallback((): boolean => {
    if (state.revives > 0) {
      persist({ ...state, revives: state.revives - 1 });
      return true;
    }
    if (state.pearls >= REVIVE_COST_PEARLS) {
      persist({ ...state, pearls: state.pearls - REVIVE_COST_PEARLS });
      return true;
    }
    return false;
  }, [state, persist]);

  const spendCraftEnergy = useCallback(
    (n = 1): boolean => {
      if (hasGamePass('lola-craft')) return true;
      if (state.craftEnergy < n) return false;
      persist({ ...state, craftEnergy: state.craftEnergy - n });
      return true;
    },
    [state, persist, hasGamePass],
  );

  const watchAdReward = useCallback((): boolean => {
    if (state.adsWatchedToday >= 10) return false;
    persist({
      ...state,
      oinkCoins: state.oinkCoins + AD_REWARD_COINS,
      adsWatchedToday: state.adsWatchedToday + 1,
    });
    return true;
  }, [state, persist]);

  const claimDailyPearls = useCallback((): boolean => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastDailyPearl === today) return false;
    persist({
      ...state,
      pearls: state.pearls + DAILY_FREE_PEARLS,
      lastDailyPearl: today,
    });
    return true;
  }, [state, persist]);

  const equipCosmetic = useCallback(
    (id: string) => {
      if (state.ownedCosmetics.includes(id)) setEquippedSkin(id);
    },
    [state.ownedCosmetics],
  );

  const value = useMemo(
    () => ({
      ...state,
      ready,
      equippedSkin,
      purchaseProduct,
      buyCosmetic,
      buyGamePass,
      spendRevive,
      spendCraftEnergy,
      grantCoins,
      grantPearls,
      grantRevives,
      refillCraftEnergy,
      watchAdReward,
      claimDailyPearls,
      coinMultiplier,
      hasGamePass,
      equipCosmetic,
    }),
    [
      state,
      ready,
      equippedSkin,
      purchaseProduct,
      buyCosmetic,
      buyGamePass,
      spendRevive,
      spendCraftEnergy,
      grantCoins,
      grantPearls,
      grantRevives,
      refillCraftEnergy,
      watchAdReward,
      claimDailyPearls,
      coinMultiplier,
      hasGamePass,
      equipCosmetic,
    ],
  );

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy() {
  const ctx = useContext(EconomyContext);
  if (!ctx) throw new Error('useEconomy must be used within EconomyProvider');
  return ctx;
}

export async function saveGameScore(gameId: ViralGameId, score: number) {
  const key = `${STORAGE_KEYS.xp}/score-${gameId}`;
  const prev = Number((await AsyncStorage.getItem(key)) || 0);
  if (score > prev) await AsyncStorage.setItem(key, String(score));
  return Math.max(prev, score);
}
