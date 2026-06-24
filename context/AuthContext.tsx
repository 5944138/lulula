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

import { STORAGE_KEYS } from '@/constants/storage';
import { HTTP_BRIDGE } from '@/constants/config';
import { fetchAuthStatus, sendOtpApi, verifyOtpApi } from '@/lib/auth/api';

type AuthContextValue = {
  phone: string;
  displayName: string;
  authDone: boolean;
  phoneVerified: boolean;
  ready: boolean;
  smsMode: 'dev' | 'twilio' | 'unknown';
  setPhone: (p: string) => void;
  requestOtp: (phone: string) => Promise<{ ok: boolean; error?: string; devCode?: string; retryAfter?: number }>;
  verifyOtp: (code: string) => Promise<{ ok: boolean; error?: string }>;
  completeProfile: (name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authDone, setAuthDone] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [smsMode, setSmsMode] = useState<'dev' | 'twilio' | 'unknown'>('unknown');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.multiGet([
        STORAGE_KEYS.phone,
        STORAGE_KEYS.displayName,
        STORAGE_KEYS.authDone,
        STORAGE_KEYS.phoneVerified,
        STORAGE_KEYS.sessionToken,
      ]),
      fetchAuthStatus(),
    ]).then(([pairs, status]) => {
      setPhoneState(pairs[0][1] ?? '');
      setDisplayName(pairs[1][1] ?? '');
      setAuthDone(pairs[2][1] === 'true');
      setPhoneVerified(pairs[3][1] === 'true');
      setSessionToken(pairs[4][1] ?? '');
      setSmsMode(status.twilioConfigured ? 'twilio' : status.smsMode === 'dev' ? 'dev' : 'unknown');
      setReady(true);
    });
  }, []);

  const setPhone = useCallback((p: string) => {
    setPhoneState(p);
    AsyncStorage.setItem(STORAGE_KEYS.phone, p);
  }, []);

  const requestOtp = useCallback(async (rawPhone: string) => {
    const result = await sendOtpApi(rawPhone);
    if (result.ok && result.phone) {
      setPhoneState(result.phone);
      await AsyncStorage.setItem(STORAGE_KEYS.phone, result.phone);
    }
    if (result.smsMode === 'dev' || result.smsMode === 'twilio') {
      setSmsMode(result.smsMode);
    }
    return {
      ok: result.ok,
      error: result.error,
      devCode: result.devCode,
      retryAfter: result.retryAfter,
    };
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!phone) return { ok: false, error: 'Falta número de teléfono' };
      const result = await verifyOtpApi(phone, code);
      if (!result.ok) {
        return { ok: false, error: result.error || 'Código inválido' };
      }
      setPhoneVerified(true);
      if (result.sessionToken) {
        setSessionToken(result.sessionToken);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.phoneVerified, 'true'],
          [STORAGE_KEYS.sessionToken, result.sessionToken],
        ]);
      }
      return { ok: true };
    },
    [phone],
  );

  const completeProfile = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    setDisplayName(trimmed);
    setAuthDone(true);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.displayName, trimmed],
      [STORAGE_KEYS.authDone, 'true'],
      [STORAGE_KEYS.nick, trimmed.replace(/\s+/g, '_').slice(0, 16)],
    ]);
  }, []);

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await fetch(`${HTTP_BRIDGE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch {
        /* noop */
      }
    }
    setAuthDone(false);
    setPhoneVerified(false);
    setDisplayName('');
    setPhoneState('');
    setSessionToken('');
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.authDone,
      STORAGE_KEYS.displayName,
      STORAGE_KEYS.phone,
      STORAGE_KEYS.phoneVerified,
      STORAGE_KEYS.sessionToken,
      STORAGE_KEYS.nick,
    ]);
  }, [sessionToken]);

  const value = useMemo(
    () => ({
      phone,
      displayName,
      authDone,
      phoneVerified,
      ready,
      smsMode,
      setPhone,
      requestOtp,
      verifyOtp,
      completeProfile,
      logout,
    }),
    [
      phone,
      displayName,
      authDone,
      phoneVerified,
      ready,
      smsMode,
      setPhone,
      requestOtp,
      verifyOtp,
      completeProfile,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
