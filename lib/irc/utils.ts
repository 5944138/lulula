import { MircColors } from '@/constants/theme';
import type { UserMode } from '@/lib/irc/types';

export function getNickColor(nick: string): string {
  let hash = 0;
  for (let i = 0; i < nick.length; i++) {
    hash = nick.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MircColors.nickColors[Math.abs(hash) % MircColors.nickColors.length];
}

export function getUserPrefix(mode: UserMode): string {
  switch (mode) {
    case 'op':
      return '@';
    case 'halfop':
      return '%';
    case 'voice':
      return '+';
    default:
      return '';
  }
}

export function getUserColor(mode: UserMode): string {
  switch (mode) {
    case 'op':
      return MircColors.op;
    case 'halfop':
      return MircColors.halfop;
    case 'voice':
      return MircColors.voice;
    default:
      return MircColors.textLight;
  }
}

export function normalizeChannel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') || trimmed.startsWith('&') ? trimmed : `#${trimmed}`;
}

export function channelKey(name: string): string {
  return encodeURIComponent(normalizeChannel(name));
}

export function decodeChannelKey(key: string): string {
  return decodeURIComponent(key);
}

export function formatTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function randomNick(): string {
  const adj = ['Cyber', 'Neon', 'Pixel', 'Retro', 'Glitch', 'Turbo'][
    Math.floor(Math.random() * 6)
  ];
  const noun = ['Wolf', 'Fox', 'Byte', 'Modem', 'Ghost', 'Wave'][
    Math.floor(Math.random() * 6)
  ];
  const num = Math.floor(Math.random() * 99);
  return `${adj}${noun}${num}`;
}
