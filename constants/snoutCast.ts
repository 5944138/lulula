/** La Línea del Hocico — solo UNA persona en el aire por ciudad (vía IRC) */

export const BROADCAST_SEC = 90;
export const HOG_COMMANDS = ['/hog', '/enelaire', '/air', '/enel_aire', '/mic'];

export function isHogClaim(text: string): boolean {
  const t = text.trim().toLowerCase().split(/\s/)[0];
  return HOG_COMMANDS.some((c) => t === c || t.startsWith(c));
}

export function isOinkReaction(text: string): boolean {
  const t = text.trim();
  return t.includes('🐷') || /\boink\b/i.test(t);
}

export const SNOUTCAST_SHARE = (
  city: string,
  nick: string,
  oinks: number,
  listeners: number,
) =>
  `🎙️ EN EL AIRE — ${city}\n` +
  `${nick} tuvo el hocico ${BROADCAST_SEC}s\n` +
  `${oinks} oinks · ${listeners} escuchando\n` +
  `¿Te atreves a /hog? lulula.app #SnoutCast #Lulula`;

export const SNOUTCAST_TAGLINES = [
  'Una ciudad. Un hocico. Un micrófono.',
  'Quien escribe /hog manda el wire.',
  'WhatsApp tiene estados. Lulula tiene EN EL AIRE.',
  'No es podcast. Es IRC con corona.',
];

export function randomTagline(seed: number): string {
  return SNOUTCAST_TAGLINES[Math.abs(seed) % SNOUTCAST_TAGLINES.length];
}
