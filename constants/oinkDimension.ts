/** La Dimensión Oink — pintura colectiva desde mensajes IRC */

export const CANVAS_SIZE = 24;

export type CanvasCell = {
  glyph: string;
  color: string;
  nick: string;
  at: string;
};

export type CanvasGrid = (CanvasCell | null)[][];

export function emptyGrid(): CanvasGrid {
  return Array.from({ length: CANVAS_SIZE }, () =>
    Array.from({ length: CANVAS_SIZE }, () => null),
  );
}

const PALETTE = ['#FF00AA', '#00FFFF', '#39FF14', '#FFAA00', '#BF00FF', '#FF4466', '#25D366'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function nickColor(nick: string): string {
  return PALETTE[hash(nick) % PALETTE.length];
}

export function messageToCell(
  msgId: string,
  nick: string,
  text: string,
): { x: number; y: number; cell: CanvasCell } {
  const h = hash(msgId + nick);
  const x = h % CANVAS_SIZE;
  const y = Math.floor(h / CANVAS_SIZE) % CANVAS_SIZE;
  const emoji = [...text].find((c) => /\p{Extended_Pictographic}/u.test(c));
  const glyph = emoji ?? (text.trim()[0]?.toUpperCase() || '🐷');
  return {
    x,
    y,
    cell: { glyph, color: nickColor(nick), nick, at: new Date().toISOString() },
  };
}

export function paintOnGrid(grid: CanvasGrid, x: number, y: number, cell: CanvasCell): CanvasGrid {
  const next = grid.map((row) => [...row]);
  next[y][x] = cell;
  return next;
}

export function countFilled(grid: CanvasGrid): number {
  return grid.flat().filter(Boolean).length;
}

export const DIMENSION_SHARE = (city: string, filled: number, chapter: string) =>
  `🌀 LA DIMENSIÓN OINK\n` +
  `Ciudad: ${city}\n` +
  `${filled} mensajes pintaron el canvas del wire\n` +
  `Leyenda: ${chapter}\n` +
  `Nadie más tiene esto. lulula.app #DimensionOink #Lulula`;
