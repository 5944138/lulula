/** Oink Wave — eventos en vivo donde el chat IRC *es* el juego multijugador */

export type WaveType = 'emoji_storm' | 'oink_flood' | 'phrase_lock' | 'city_siege';

export type WavePhase = 'idle' | 'countdown' | 'live' | 'results';

export type WaveChallenge = {
  id: string;
  type: WaveType;
  title: string;
  hook: string;
  instruction: string;
  durationSec: number;
  targetEmoji?: string;
  targetPhrase?: string;
  accent: string;
};

export const WAVE_POOL: WaveChallenge[] = [
  {
    id: 'storm-fire',
    type: 'emoji_storm',
    title: 'Emoji Storm',
    hook: 'El wire explota en 60 segundos',
    instruction: '¡Manda 🔥 en tu sala de ciudad antes que nadie!',
    durationSec: 60,
    targetEmoji: '🔥',
    accent: '#FF4466',
  },
  {
    id: 'oink-flood',
    type: 'oink_flood',
    title: 'Oink Flood',
    hook: 'Inundación de cerdos',
    instruction: 'Escribe "oink" o 🐷 todo lo que puedas — cada uno suma',
    durationSec: 45,
    accent: '#FF00AA',
  },
  {
    id: 'phrase-lock',
    type: 'phrase_lock',
    title: 'Phrase Lock',
    hook: 'Lulula bloqueó una frase sagrada',
    instruction: 'Escribe exacto: lulula on top',
    durationSec: 50,
    targetPhrase: 'lulula on top',
    accent: '#00FFFF',
  },
  {
    id: 'city-siege',
    type: 'city_siege',
    title: 'City Siege',
    hook: 'Tu ciudad vs la rival — guerra de mensajes',
    instruction: 'Cualquier mensaje en tu sala suma puntos para tu ciudad',
    durationSec: 90,
    accent: '#FFAA00',
  },
];

/** Cada 5 min una wave; a las 15:00 hora local = mega wave */
export const WAVE_INTERVAL_MS = 5 * 60 * 1000;
export const COUNTDOWN_SEC = 45;
export const MEGA_WAVE_HOUR = 15;

export function pickWaveChallenge(seed: number): WaveChallenge {
  return WAVE_POOL[Math.abs(seed) % WAVE_POOL.length];
}

export function getWaveSchedule(now = Date.now()) {
  const d = new Date(now);
  const slot = Math.floor(now / WAVE_INTERVAL_MS);
  const nextSlotStart = (slot + 1) * WAVE_INTERVAL_MS;
  const msUntilNext = nextSlotStart - now;
  const isMega = d.getHours() === MEGA_WAVE_HOUR && d.getMinutes() < 20;
  return { slot, msUntilNext, isMega, nextAt: nextSlotStart };
}

export const OINK_WAVE_SHARE = (
  city: string,
  rival: string,
  won: boolean,
  score: number,
  waveTitle: string,
) =>
  `🐷 OINK WAVE — ${waveTitle}\n` +
  `${won ? '🏆' : '💀'} ${city} ${won ? 'le ganó a' : 'perdió vs'} ${rival}\n` +
  `Yo sumé ${score} pts en el chat IRC\n` +
  `¿Tu ciudad aguanta? lulula.app #OinkWave #Lulula`;
