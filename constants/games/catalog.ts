import type { LululaMood } from '@/constants/lulula';

/** IDs de experiencias virales (inspiradas en tendencias — no afiliadas). */
export type ViralGameId =
  | 'lola-verse'
  | 'lola-craft'
  | 'oink-us'
  | 'fall-oink'
  | 'lola-run';

export type SocialGameId = 'wire-chat';

export type GameId = ViralGameId | SocialGameId;

export type MonetizationHook =
  | 'game-pass'
  | 'cosmetics'
  | 'currency'
  | 'revive'
  | 'energy'
  | 'battle-pass'
  | 'loot-box';

export type ViralGame = {
  id: ViralGameId;
  title: string;
  subtitle: string;
  inspiredBy: string;
  emoji: string;
  lolaMood: LululaMood;
  lolaLine: string;
  status: 'live' | 'beta' | 'soon';
  xpReward: number;
  coinReward: number;
  route: `/games/${ViralGameId}`;
  hooks: MonetizationHook[];
  tags: string[];
  accent: string;
  /** Multiplicador de monedas con Game Pass activo */
  passMultiplier: number;
};

export const VIRAL_GAMES: ViralGame[] = [
  {
    id: 'lola-verse',
    title: 'Lulula Verse',
    subtitle: 'Hub social — entra a mundos, avatares y fiestas',
    inspiredBy: 'Roblox',
    emoji: '🌐',
    lolaMood: 'excited',
    lolaLine: 'Un universo, mil fiestas. Tu avatar manda.',
    status: 'live',
    xpReward: 40,
    coinReward: 25,
    route: '/games/lola-verse',
    hooks: ['game-pass', 'cosmetics', 'battle-pass', 'currency'],
    tags: ['social', 'avatar', 'hub'],
    accent: '#FF00AA',
    passMultiplier: 2,
  },
  {
    id: 'lola-craft',
    title: 'Lulula Craft',
    subtitle: 'Construye, mina y sobrevive en bloques',
    inspiredBy: 'Minecraft',
    emoji: '⛏️',
    lolaMood: 'play',
    lolaLine: 'Pon bloques. Rompe bloques. Domina el mundo.',
    status: 'live',
    xpReward: 35,
    coinReward: 20,
    route: '/games/lola-craft',
    hooks: ['energy', 'cosmetics', 'currency', 'game-pass'],
    tags: ['sandbox', 'creative', 'build'],
    accent: '#39FF14',
    passMultiplier: 2,
  },
  {
    id: 'oink-us',
    title: 'Oink Us',
    subtitle: '¿Quién es el cerdo falso? Vota antes de que te eliminen',
    inspiredBy: 'Among Us',
    emoji: '🕵️',
    lolaMood: 'think',
    lolaLine: 'Confía en nadie. Excepto en mí. Bueno… tal vez.',
    status: 'live',
    xpReward: 50,
    coinReward: 30,
    route: '/games/oink-us',
    hooks: ['cosmetics', 'game-pass', 'loot-box'],
    tags: ['social', 'deduction', 'multiplayer'],
    accent: '#FF4466',
    passMultiplier: 1.5,
  },
  {
    id: 'fall-oink',
    title: 'Fall Oink',
    subtitle: 'Eliminatorias caóticas — solo uno llega a la meta',
    inspiredBy: 'Fall Guys',
    emoji: '🏆',
    lolaMood: 'happy',
    lolaLine: 'Resbala, salta, gana. El hocico es aerodinámico.',
    status: 'live',
    xpReward: 45,
    coinReward: 28,
    route: '/games/fall-oink',
    hooks: ['cosmetics', 'revive', 'currency', 'battle-pass'],
    tags: ['party', 'race', 'casual'],
    accent: '#FFAA00',
    passMultiplier: 2,
  },
  {
    id: 'lola-run',
    title: 'Lulula Run',
    subtitle: 'Corre infinito, esquiva y colecciona perlas',
    inspiredBy: 'Subway Surfers',
    emoji: '🚇',
    lolaMood: 'wink',
    lolaLine: 'Corre como si el feed te persiguiera.',
    status: 'live',
    xpReward: 30,
    coinReward: 15,
    route: '/games/lola-run',
    hooks: ['revive', 'currency', 'cosmetics', 'game-pass'],
    tags: ['endless', 'arcade', 'hyper-casual'],
    accent: '#00FFFF',
    passMultiplier: 2,
  },
];

export const WIRE_CHAT = {
  id: 'wire-chat' as const,
  title: 'Wire Chat',
  subtitle: 'IRC en vivo — aparte del arcade, siempre ON',
  emoji: '📞',
  lolaMood: 'phone' as LululaMood,
  lolaLine: 'El chat original. Gente real, cero algoritmo.',
  route: '/(tabs)/chats',
};

export function getViralGame(id: ViralGameId): ViralGame | undefined {
  return VIRAL_GAMES.find((g) => g.id === id);
}

export function getAllPlayableGames(): ViralGame[] {
  return VIRAL_GAMES.filter((g) => g.status === 'live' || g.status === 'beta');
}
