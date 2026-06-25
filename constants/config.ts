import { Platform } from 'react-native';

function resolveHost(): string {
  if (process.env.EXPO_PUBLIC_WS_HOST) return process.env.EXPO_PUBLIC_WS_HOST;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }
  return Platform.select({ android: '10.0.2.2', ios: 'localhost', default: 'localhost' }) ?? 'localhost';
}

const host = resolveHost();
const port = process.env.EXPO_PUBLIC_WS_PORT || '8787';

export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || `ws://${host}:${port}`;

export const BRAND = {
  name: 'Lulula',
  ciudad: 'Minatitlán',
  tagline: 'Una palabra. 60 segundos. Cada noche.',
  signalHour: '21:00',
};
