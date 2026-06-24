import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  CITY_CHANNELS,
  CITIES,
  getCity,
  getTribe,
  type CityId,
} from '@/constants/world';
import { LEGACY_KEYS, LEGACY_LOLAPHONE_KEYS, STORAGE_KEYS, pickMigratedChain } from '@/constants/storage';

type IdentityContextValue = {
  cityId: CityId | null;
  tribeId: string | null;
  cityName: string;
  tribeName: string;
  tribeEmoji: string;
  /** @deprecated use tribeName — alias for profile compat */
  schoolName: string;
  schoolEmoji: string;
  onboardingDone: boolean;
  ready: boolean;
  channelsForCity: string[];
  setIdentity: (cityId: CityId, tribeId: string) => Promise<void>;
  clearIdentity: () => Promise<void>;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityId] = useState<CityId | null>(null);
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([
      STORAGE_KEYS.city,
      STORAGE_KEYS.tribe,
      STORAGE_KEYS.onboarding,
      LEGACY_LOLAPHONE_KEYS.city,
      LEGACY_LOLAPHONE_KEYS.tribe,
      LEGACY_LOLAPHONE_KEYS.onboarding,
      LEGACY_KEYS.city,
      LEGACY_KEYS.tribe,
      LEGACY_KEYS.school,
      LEGACY_KEYS.onboarding,
    ]).then((pairs) => {
      const c = pickMigratedChain(
        pairs,
        STORAGE_KEYS.city,
        LEGACY_LOLAPHONE_KEYS.city,
        LEGACY_KEYS.city,
      ) as CityId | null;
      const tribe =
        pickMigratedChain(pairs, STORAGE_KEYS.tribe, LEGACY_LOLAPHONE_KEYS.tribe, LEGACY_KEYS.tribe) ||
        pickMigratedChain(pairs, STORAGE_KEYS.tribe, LEGACY_LOLAPHONE_KEYS.tribe, LEGACY_KEYS.school);
      const done =
        pickMigratedChain(
          pairs,
          STORAGE_KEYS.onboarding,
          LEGACY_LOLAPHONE_KEYS.onboarding,
          LEGACY_KEYS.onboarding,
        ) === 'true';
      if (c && CITIES.some((x) => x.id === c)) setCityId(c);
      if (tribe) setTribeId(tribe);
      setOnboardingDone(done);
      setReady(true);
    });
  }, []);

  const setIdentity = useCallback(async (city: CityId, tribe: string) => {
    setCityId(city);
    setTribeId(tribe);
    setOnboardingDone(true);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.city, city],
      [STORAGE_KEYS.tribe, tribe],
      [STORAGE_KEYS.onboarding, 'true'],
    ]);
  }, []);

  const clearIdentity = useCallback(async () => {
    setCityId(null);
    setTribeId(null);
    setOnboardingDone(false);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.city,
      STORAGE_KEYS.tribe,
      STORAGE_KEYS.onboarding,
    ]);
  }, []);

  const city = cityId ? getCity(cityId) : null;
  const tribe = tribeId ? getTribe(tribeId) : null;

  const value = useMemo(
    () => ({
      cityId,
      tribeId,
      cityName: city?.name ?? '',
      tribeName: tribe?.name ?? 'Explorer',
      tribeEmoji: tribe?.emoji ?? '👻',
      schoolName: tribe?.name ?? 'Explorer',
      schoolEmoji: tribe?.emoji ?? '👻',
      onboardingDone,
      ready,
      channelsForCity: cityId ? CITY_CHANNELS(cityId) : [],
      setIdentity,
      clearIdentity,
    }),
    [cityId, tribeId, city, tribe, onboardingDone, ready, setIdentity, clearIdentity],
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider');
  return ctx;
}
