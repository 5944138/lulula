import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

import { GLOBAL_CHANNELS } from '@/constants/world';
import { useGamification } from '@/context/GamificationContext';
import { useAuth } from '@/context/AuthContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

import { STORAGE_KEYS } from '@/constants/storage';

/** Auto-conecta al abrir la app si ya completó onboarding */
export default function AutoConnect() {
  const { connectionState, connect, joinChannels } = useIRC();
  const { onboardingDone, ready, channelsForCity } = useIdentity();
  const { authDone } = useAuth();
  const { recordLogin, recordRoomJoin } = useGamification();
  const didAuto = useRef(false);
  const didJoin = useRef(false);
  const joinedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!ready || !onboardingDone || !authDone || didAuto.current) return;
    if (connectionState !== 'idle' && connectionState !== 'disconnected') return;

    didAuto.current = true;
    AsyncStorage.getItem(STORAGE_KEYS.nick).then((storedNick) => {
      if (storedNick && storedNick.length >= 2) {
        connect(storedNick);
      }
    });
  }, [ready, onboardingDone, authDone, connectionState, connect]);

  useEffect(() => {
    if (connectionState !== 'connected' || !onboardingDone || !authDone || didJoin.current) return;
    didJoin.current = true;

    recordLogin();

    const toJoin = [
      ...channelsForCity,
      GLOBAL_CHANNELS.world,
      GLOBAL_CHANNELS.lounge,
      GLOBAL_CHANNELS.sala3pm,
      GLOBAL_CHANNELS.global,
    ];

    joinChannels(toJoin);
    toJoin.forEach((ch) => {
      if (!joinedRef.current.has(ch)) {
        joinedRef.current.add(ch);
        recordRoomJoin();
      }
    });
  }, [connectionState, onboardingDone, authDone, channelsForCity, joinChannels, recordLogin, recordRoomJoin]);

  return null;
}
