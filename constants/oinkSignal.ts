/** LA SEÑAL OINK — The Drop. Un momento global. Una palabra. Todo el planeta. */

export type SignalPhase = 'dormant' | 'countdown' | 'live' | 'reveal';

export type SignalQuestion = {
  id: number;
  emoji: string;
  prompt: string;
  hint: string;
};

export const SIGNAL_CYCLE_MS = 5 * 60 * 1000;
export const SIGNAL_COUNTDOWN_SEC = 20;
export const SIGNAL_LIVE_SEC = 60;
export const SIGNAL_REVEAL_SEC = 14;
export const SIGNAL_WINDOW_MS =
  (SIGNAL_COUNTDOWN_SEC + SIGNAL_LIVE_SEC + SIGNAL_REVEAL_SEC) * 1000;

export const SIGNAL_QUESTIONS: SignalQuestion[] = [
  {
    id: 0,
    emoji: '📡',
    prompt: 'Si el planeta solo pudiera gritar UNA palabra ahora, ¿cuál?',
    hint: 'Escribe una palabra en tu sala. O: /senal palabra',
  },
  {
    id: 1,
    emoji: '🔥',
    prompt: '¿Qué palabra quema en la mente colectiva en este segundo?',
    hint: 'Una palabra. Tu ciudad compite contra el mundo.',
  },
  {
    id: 2,
    emoji: '💭',
    prompt: 'Completa el susurro del wire: "Lo que todos queremos es ___"',
    hint: '/senal [tu palabra]',
  },
  {
    id: 3,
    emoji: '⚡',
    prompt: 'Una palabra para romper el algoritmo. ¿Cuál mandas?',
    hint: 'IRC real. 60 segundos. Sin segunda oportunidad.',
  },
  {
    id: 4,
    emoji: '🌊',
    prompt: 'Si tu ciudad fuera un grito colectivo, ¿cómo sonaría en una palabra?',
    hint: 'Cada mensaje cuenta. La más repetida gana.',
  },
  {
    id: 5,
    emoji: '👁',
    prompt: 'Lulula escucha. ¿Qué palabra define este instante del universo?',
    hint: 'Una palabra en el chat = un voto.',
  },
];

export function getSignalSlot(now = Date.now()) {
  return Math.floor(now / SIGNAL_CYCLE_MS);
}

export function getSignalPhase(now = Date.now()): SignalPhase {
  const elapsed = now % SIGNAL_CYCLE_MS;
  const start = SIGNAL_CYCLE_MS - SIGNAL_WINDOW_MS;
  if (elapsed < start) return 'dormant';

  const inWindow = elapsed - start;
  if (inWindow < SIGNAL_COUNTDOWN_SEC * 1000) return 'countdown';
  if (inWindow < (SIGNAL_COUNTDOWN_SEC + SIGNAL_LIVE_SEC) * 1000) return 'live';
  return 'reveal';
}

export function msUntilSignal(now = Date.now()): number {
  const elapsed = now % SIGNAL_CYCLE_MS;
  const start = SIGNAL_CYCLE_MS - SIGNAL_WINDOW_MS;
  if (elapsed >= start) return 0;
  return start - elapsed;
}

export function secLeftInPhase(now = Date.now()): number {
  const phase = getSignalPhase(now);
  const elapsed = now % SIGNAL_CYCLE_MS;
  const start = SIGNAL_CYCLE_MS - SIGNAL_WINDOW_MS;
  const inWindow = Math.max(0, elapsed - start);

  if (phase === 'countdown') {
    return Math.ceil((SIGNAL_COUNTDOWN_SEC * 1000 - inWindow) / 1000);
  }
  if (phase === 'live') {
    const liveElapsed = inWindow - SIGNAL_COUNTDOWN_SEC * 1000;
    return Math.ceil((SIGNAL_LIVE_SEC * 1000 - liveElapsed) / 1000);
  }
  if (phase === 'reveal') {
    const revealElapsed = inWindow - (SIGNAL_COUNTDOWN_SEC + SIGNAL_LIVE_SEC) * 1000;
    return Math.ceil((SIGNAL_REVEAL_SEC * 1000 - revealElapsed) / 1000);
  }
  return Math.ceil(msUntilSignal(now) / 1000);
}

export function getQuestionForSlot(slot: number): SignalQuestion {
  return SIGNAL_QUESTIONS[slot % SIGNAL_QUESTIONS.length];
}

export function parseSignalWord(text: string): string | null {
  const trimmed = text.trim();
  const cmd = trimmed.match(/^\/senal\s+(\S+)/i);
  if (cmd) return sanitizeWord(cmd[1]);
  if (trimmed.startsWith('/')) return null;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) return sanitizeWord(words[0]);
  return null;
}

function sanitizeWord(w: string): string | null {
  const clean = w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  if (clean.length < 2 || clean.length > 18) return null;
  return clean;
}

export function pickCityWord(tally: Map<string, number>): string {
  let best = 'oink';
  let max = 0;
  for (const [word, count] of tally) {
    if (count > max) {
      max = count;
      best = word;
    }
  }
  return best;
}

export function simulateGlobalWinner(
  slot: number,
  cityWord: string,
  cityVotes: number,
  cityName: string,
): { word: string; city: string; globalVotes: number } {
  const rivals = ['Tokyo', 'New York', 'London', 'Seoul', 'CDMX', 'Lagos'];
  const rival = rivals[slot % rivals.length];
  const rivalWords = ['fuego', 'amor', 'libertad', 'caos', 'paz', 'vida', 'oink', 'wire'];
  const rivalWord = rivalWords[(slot * 7 + cityWord.length) % rivalWords.length];
  const rivalVotes = 3 + (slot * 13) % 12;

  if (cityVotes >= rivalVotes) {
    return { word: cityWord, city: cityName, globalVotes: cityVotes * 847 + slot * 91 };
  }
  return { word: rivalWord, city: rival, globalVotes: rivalVotes * 847 + slot * 91 };
}

export const SIGNAL_SHARE = (word: string, city: string, won: boolean) =>
  `${won ? '🏆' : '📡'} LA SEÑAL OINK\n` +
  `Palabra del planeta: "${word.toUpperCase()}" — ${city}\n` +
  `60 segundos. Una palabra. IRC real. Solo en Lulula.\n` +
  `https://github.com/5944138/lulula`;

export const WIRE_MANIFESTO =
  'WhatsApp abre la puerta. mIRC es el motor. La Señal es el alma.';
