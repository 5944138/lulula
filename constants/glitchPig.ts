/** El Cerdo Glitch — entidad ARG que solo la ciudad puede banear vía IRC */

export const BANISH_SEQUENCE = ['L', 'U', 'L', 'U', 'L', 'A'] as const;
export const BANISH_WINDOW_SEC = 180;
export const SPAWN_INTERVAL_MS = 25 * 60 * 1000;

export const GLITCH_SPAWN_LINES = [
  '◢◤ ERROR: un cerdo cruzó el firewall de tu ciudad',
  '◢◤ LULULA_NOISE: no deberías haber abierto esa sala',
  '◢◤ WIRE_BREACH: el hocico está en tu historial de chat',
  '◢◤ 01001111 01001001 01001110 01001011',
];

export const GLITCH_TAUNTS = [
  'Nadie banhea al cerdo...',
  'Escriban la secuencia o el wire se corrompe',
  '¿Tanto miedo a seis letras?',
  'Tu ciudad ya está infectada 🐷',
];

export const GLITCH_SHARE = (city: string, helpers: number, sec: number) =>
  `👾 CERDO GLITCH BANEADO\n` +
  `${city} escribió L-U-L-U-L-A en el IRC en ${sec}s\n` +
  `${helpers} jugadores salvaron el wire\n` +
  `¿Tu ciudad aguanta? lulula.app #GlitchPig #Lulula`;

export function normalizeLetter(text: string): string | null {
  const t = text.trim().toUpperCase();
  if (t.length === 0) return null;
  const ch = t[0];
  if (/[A-Z]/.test(ch)) return ch;
  return null;
}

export function matchesSequenceStep(text: string, expected: string): boolean {
  const ch = normalizeLetter(text);
  return ch === expected;
}

export function pickSpawnLine(seed: number): string {
  return GLITCH_SPAWN_LINES[Math.abs(seed) % GLITCH_SPAWN_LINES.length];
}

export function pickTaunt(seed: number): string {
  return GLITCH_TAUNTS[Math.abs(seed) % GLITCH_TAUNTS.length];
}

/** Profecía generada del caos del chat — Oink Oracle */
export function generateOracle(words: string[]): string {
  if (words.length < 3) {
    return 'Lulula ve silencio. El wire espera tu primer oink.';
  }
  const pick = (i: number) => words[Math.abs(i * 997) % words.length];
  const templates = [
    `Cuando "${pick(0)}" se encuentre con "${pick(1)}", alguien escribirá /hog.`,
    `El hocico dorado está cerca de quien dijo "${pick(2)}".`,
    `Tu tribu sueña con "${pick(3)}" — es señal de Oink Wave.`,
    `"${pick(4)}" fue la palabra. La siguiente será legendaria.`,
    `Lulula susurra: ${pick(5)} + ${pick(6)} = caos viral.`,
  ];
  return templates[Math.abs(words.join('').length) % templates.length];
}
