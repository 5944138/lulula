import { Platform } from 'react-native';

function resolveHost(): string {
  if (process.env.EXPO_PUBLIC_WS_HOST) {
    return process.env.EXPO_PUBLIC_WS_HOST;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }
  return (
    Platform.select({
      android: '10.0.2.2',
      ios: 'localhost',
      default: 'localhost',
    }) ?? 'localhost'
  );
}

const host = resolveHost();
const port = process.env.EXPO_PUBLIC_WS_PORT || '8787';

export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || `ws://${host}:${port}`;
export const HTTP_BRIDGE = `http://${host}:${port}`;

export const BRAND = {
  name: 'Lulula',
  mascot: 'Lulula',
  tagline: 'La cerdita viral. Chat, juegos, caos.',
  version: '2.0.0',
  ircNetwork: 'Libera Chat',
};

/** Salas con actividad real garantizada en Libera */
export const LIVE_CHANNELS = [
  { name: '##chat', emoji: '🔥', tagline: 'Global room — always live', vibe: 'LIVE' },
  { name: '#python', emoji: '🐍', tagline: 'Devs and learners', vibe: 'Tech' },
  { name: '#music', emoji: '🎵', tagline: 'What are you listening to?', vibe: 'Vibes' },
];

export const VIBE_STATUSES = [
  '🟢 Online — vibing',
  '📞 Busy — on a call',
  '💤 AFK — got snacks',
  '🎧 Listening to music',
  '📚 Studying (DND)',
  '👾 In ranked',
  '✨ Looking for cool people',
];

export const QUICK_EMOJIS = ['😂', '🔥', '💀', '👀', '❤️', '😭', '⚡', '👋', '🫡', '✨'];

export const NICK_ADJECTIVES = [
  'Cyber', 'Neon', 'Pixel', 'Retro', 'Digital', 'Cosmic', 'Glitch', 'Turbo',
];
export const NICK_NOUNS = [
  'Wolf', 'Cat', 'Fox', 'Wave', 'Byte', 'Modem', 'Ghost', 'Viper',
];
