export type SignalPhase = 'countdown' | 'aviso' | 'live' | 'reveal' | 'resultado';

export type TopWord = { word: string; count: number };

export type SenalResult = {
  question: string;
  fecha: string;
  winningWord: string;
  winningCount: number;
  topWords: TopWord[];
  totalPlayers: number;
};

export const CIUDAD = 'Minatitlán';

export function buildShareText(
  result: SenalResult,
  yourWord: string | null,
  rareNote: string | null,
): string {
  const lines = [
    `📡 La Señal · ${CIUDAD}`,
    `"${result.question}"`,
    '',
    `${CIUDAD} dijo: ${result.winningWord.toUpperCase()} (${result.winningCount} personas)`,
    yourWord ? `Yo dije: ${yourWord}` : '',
    rareNote ?? '',
    '',
    '¿Tú qué hubieras dicho? Una palabra. 60 segundos. Cada noche.',
  ];
  return lines.filter(Boolean).join('\n');
}
