/** Mente Colectiva — deseos arquetípicos del wire humano */

export type DesireId =
  | 'conexion'
  | 'amor'
  | 'libertad'
  | 'poder'
  | 'caos'
  | 'paz';

export type MindPhase = 'idle' | 'whisper' | 'active' | 'resonating' | 'celebration';

export type Desire = {
  id: DesireId;
  label: string;
  emoji: string;
  color: string;
  whisper: string;
  mantra: string;
  keywords: string[];
  confessionTemplates: string[];
};

export const DESIRES: Desire[] = [
  {
    id: 'conexion',
    label: 'CONEXIÓN',
    emoji: '🫂',
    color: '#00E5FF',
    whisper: 'El mundo está solo. Quiere que alguien diga hola.',
    mantra: 'no estoy solo',
    keywords: [
      'hola', 'hey', 'alone', 'solo', 'sola', 'amigos', 'friend', 'habla', 'chat',
      'conectar', 'dm', 'quién', 'alguien', 'nadie', 'lonely', 'abrazo', '🫂', '👋',
    ],
    confessionTemplates: [
      'Alguien en {city} solo quería que le contestaran.',
      'Un alma en {city} escribió "hola" 47 veces hasta que alguien respondió.',
      'La mente colectiva confiesa: todos fingen estar bien.',
    ],
  },
  {
    id: 'amor',
    label: 'AMOR',
    emoji: '💘',
    color: '#FF2D95',
    whisper: 'Millones susurran un nombre que no se atreven a decir.',
    mantra: 'dilo en voz alta',
    keywords: [
      'amor', 'love', 'crush', 'beso', 'kiss', 'corazón', 'heart', '❤️', '💕', 'te amo',
      'hermosa', 'guapo', 'cute', 'ship', 'romance', 'enamor', 'extraño', 'miss you',
    ],
    confessionTemplates: [
      'En {city} alguien escribió su crush y borró el mensaje.',
      'El deseo más común del planeta: ser elegidos.',
      'Un corazón en {city} late más fuerte en el IRC que en la vida real.',
    ],
  },
  {
    id: 'libertad',
    label: 'LIBERTAD',
    emoji: '🕊️',
    color: '#7CFF6B',
    whisper: 'Todos quieren escapar de algo. Nadie dice de qué.',
    mantra: 'sal de la jaula',
    keywords: [
      'libre', 'free', 'freedom', 'escape', 'viajar', 'travel', 'salir', 'fuga', 'volar',
      'dream', 'sueño', 'lejos', 'away', 'quit', 'renunciar', '🕊️', '✈️', 'road',
    ],
    confessionTemplates: [
      '{city} soñó con un tren a ninguna parte.',
      'La mente colectiva quiere un mapa sin fronteras.',
      'Alguien en {city} ya empacó mentalmente. Solo falta el mensaje.',
    ],
  },
  {
    id: 'poder',
    label: 'PODER',
    emoji: '👑',
    color: '#FFD700',
    whisper: 'El planeta quiere ganar. A algo. A cualquier cosa.',
    mantra: 'somos imparables',
    keywords: [
      'ganar', 'win', 'top', 'boss', 'rey', 'queen', 'king', 'poder', 'power', 'dominar',
      'ranked', 'mvp', 'goat', 'legend', '👑', '🔥', 'imparable', 'crush', 'victoria',
    ],
    confessionTemplates: [
      '{city} no quiere ser segundo en nada hoy.',
      'El ego colectivo pide una corona compartida.',
      'Todos en {city} fingieron no importarles el leaderboard. Mienten.',
    ],
  },
  {
    id: 'caos',
    label: 'CAOS',
    emoji: '💀',
    color: '#FF4466',
    whisper: 'El aburrimiento global alcanzó punto crítico. Necesita explosión.',
    mantra: 'rompe el algoritmo',
    keywords: [
      'jaja', 'lol', 'lmao', 'wtf', 'loco', 'crazy', 'chaos', 'caos', 'random', '💀', '🔥',
      'explota', 'meme', 'bruh', 'xd', 'ajjaja', 'no way', 'insane', 'wild', 'absurdo',
    ],
    confessionTemplates: [
      '{city} necesitaba reírse a las 3am con extraños.',
      'El caos es el lenguaje universal del wire.',
      'Alguien en {city} mandó el peor meme del siglo. Fue arte.',
    ],
  },
  {
    id: 'paz',
    label: 'PAZ',
    emoji: '🧘',
    color: '#B388FF',
    whisper: 'Detrás de cada pantalla hay alguien agotado. Pide silencio.',
    mantra: 'respira conmigo',
    keywords: [
      'paz', 'peace', 'calma', 'zen', 'respira', 'breathe', 'chill', 'relax', 'tranqui',
      'silencio', 'quiet', 'medita', 'sleep', 'dormir', '🧘', '☮️', 'soft', 'gentle',
    ],
    confessionTemplates: [
      '{city} pidió un segundo de paz en un mundo ruidoso.',
      'La mente colectiva suspiró al unísono.',
      'Alguien en {city} solo quería que nadie le pidiera nada hoy.',
    ],
  },
];

export const WHISPER_SEC = 45;
export const RESONANCE_WINDOW_SEC = 90;
export const RESONANCE_GOAL = 100;
export const DESEO_CMD_MULTIPLIER = 3;
export const MEGA_RESONANCE_CHANCE = 0.22;
export const CYCLE_MS = 7 * 60 * 1000;

export function getDesire(id: DesireId): Desire {
  return DESIRES.find((d) => d.id === id) ?? DESIRES[0];
}

/** Slot cada 7 min — deseo mundial determinista */
export function getWorldDesireSlot(now = Date.now()): { slot: number; desireId: DesireId; mega: boolean } {
  const slot = Math.floor(now / CYCLE_MS);
  const desireId = DESIRES[slot % DESIRES.length].id;
  const mega = (slot * 9973) % 100 < MEGA_RESONANCE_CHANCE * 100;
  return { slot, desireId, mega };
}

export function msUntilNextWhisper(now = Date.now()): number {
  const elapsed = now % CYCLE_MS;
  const whisperStart = CYCLE_MS - WHISPER_SEC * 1000;
  if (elapsed >= whisperStart) return 0;
  return whisperStart - elapsed;
}

export function msUntilResonanceEnd(now = Date.now()): number {
  const elapsed = now % CYCLE_MS;
  const windowStart = CYCLE_MS - (WHISPER_SEC + RESONANCE_WINDOW_SEC) * 1000;
  if (elapsed < windowStart) return 0;
  return CYCLE_MS - elapsed;
}

export function getMindPhase(now = Date.now()): MindPhase {
  const elapsed = now % CYCLE_MS;
  const whisperStart = CYCLE_MS - WHISPER_SEC * 1000;
  const activeStart = CYCLE_MS - (WHISPER_SEC + RESONANCE_WINDOW_SEC) * 1000;

  if (elapsed >= whisperStart) return 'whisper';
  if (elapsed >= activeStart) return 'active';
  return 'idle';
}

export function scoreMessageForDesire(text: string, desire: Desire): number {
  const lower = text.toLowerCase().trim();
  if (!lower || lower.startsWith('/')) return 0;

  let score = 0;
  for (const kw of desire.keywords) {
    if (lower.includes(kw)) {
      score += kw.length > 4 ? 14 : 10;
    }
  }
  if (lower === desire.mantra) score += 50;
  if (lower.includes(desire.mantra)) score += 25;
  return Math.min(score, 40);
}

export function parseDeseoCommand(text: string): string | null {
  const m = text.trim().match(/^\/deseo\s+(.+)/i);
  return m ? m[1].trim() : null;
}

export function pickConfession(desire: Desire, cityName: string): string {
  const templates = desire.confessionTemplates;
  const t = templates[Math.floor(Math.random() * templates.length)];
  return t.replace('{city}', cityName);
}

export function simulateWorldSouls(slot: number): number {
  const base = 1_800_000 + (slot % 17) * 47_000;
  const jitter = (slot * 31337) % 120_000;
  return base + jitter;
}

export function simulateRivalProgress(rivalName: string, slot: number, elapsedInWindow: number): number {
  const seed = rivalName.length * 7919 + slot * 997;
  const rate = 0.35 + (seed % 40) / 100;
  return Math.min(RESONANCE_GOAL, Math.floor(elapsedInWindow * rate * 1.2));
}

export const RESONANCE_SHARE = (
  city: string,
  desire: string,
  streak: number,
  mega: boolean,
) =>
  `${mega ? '⚡ MEGA ' : ''}RESONANCIA en ${city} 🌍\n` +
  `La mente colectiva pidió ${desire} y nosotros respondimos.\n` +
  `Racha: ${streak} · Solo en Lulula — el IRC es el juego\n` +
  `https://github.com/5944138/lulula`;
