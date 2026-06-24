import type { MonetizationHook, ViralGameId } from '@/constants/games/catalog';

export type CurrencyId = 'oinkCoins' | 'pearls';

export type ProductKind = 'consumable' | 'durable' | 'subscription';

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  kind: ProductKind;
  pricePearls?: number;
  priceUsd?: number;
  priceCoins?: number;
  grantCoins?: number;
  grantPearls?: number;
  hook: MonetizationHook;
  emoji: string;
  /** SKU para App Store / Play Billing / Stripe */
  sku: string;
};

export type GamePass = {
  id: string;
  gameId: ViralGameId;
  name: string;
  benefits: string[];
  pricePearls: number;
  priceUsd: number;
  sku: string;
};

export type CosmeticItem = {
  id: string;
  slot: 'skin' | 'hat' | 'trail' | 'emote' | 'block-pack';
  name: string;
  priceCoins?: number;
  pricePearls?: number;
  rarity: 'common' | 'rare' | 'legendary';
  emoji: string;
};

export const CURRENCY = {
  oinkCoins: { label: 'Oink Coins', emoji: '🪙', symbol: 'OC' },
  pearls: { label: 'Perlas', emoji: '💎', symbol: 'PR' },
} as const;

/** Productos globales — integrar IAP real vía RevenueCat / expo-in-app-purchases */
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'pearls-100',
    name: 'Bolsa de Perlas',
    description: '100 perlas — cosméticos y revives',
    kind: 'consumable',
    priceUsd: 0.99,
    grantPearls: 100,
    hook: 'currency',
    emoji: '💎',
    sku: 'lulula.pearls.100',
  },
  {
    id: 'pearls-550',
    name: 'Cofre de Perlas',
    description: '550 perlas (+10% bonus)',
    kind: 'consumable',
    priceUsd: 4.99,
    grantPearls: 550,
    hook: 'currency',
    emoji: '💎',
    sku: 'lulula.pearls.550',
  },
  {
    id: 'coins-5000',
    name: 'Saco de Oink Coins',
    description: '5000 monedas — skins y entradas',
    kind: 'consumable',
    pricePearls: 50,
    grantCoins: 5000,
    hook: 'currency',
    emoji: '🪙',
    sku: 'lulula.coins.5000',
  },
  {
    id: 'revive-3',
    name: '3 Revives',
    description: 'Continúa en Lulula Run y Fall Oink',
    kind: 'consumable',
    pricePearls: 30,
    hook: 'revive',
    emoji: '❤️‍🩹',
    sku: 'lulula.revive.3',
  },
  {
    id: 'energy-refill',
    name: 'Energía Lulula Craft',
    description: '+50 bloques de construcción hoy',
    kind: 'consumable',
    pricePearls: 20,
    hook: 'energy',
    emoji: '⚡',
    sku: 'lulula.energy.refill',
  },
  {
    id: 'battle-pass-s1',
    name: 'Pase de Temporada 1',
    description: 'Skins exclusivos + 2x monedas 30 días',
    kind: 'subscription',
    priceUsd: 6.99,
    hook: 'battle-pass',
    emoji: '🎫',
    sku: 'lulula.battlepass.s1',
  },
  {
    id: 'loot-oink',
    name: 'Caja Oink',
    description: 'Cosmético aleatorio — rareza garantizada',
    kind: 'consumable',
    pricePearls: 40,
    hook: 'loot-box',
    emoji: '📦',
    sku: 'lulula.loot.oink',
  },
];

export const GAME_PASSES: GamePass[] = [
  {
    id: 'pass-lola-verse',
    gameId: 'lola-verse',
    name: 'Verse VIP',
    benefits: ['2x Oink Coins', 'Avatar legendario', 'Acceso beta a mundos'],
    pricePearls: 120,
    priceUsd: 2.99,
    sku: 'lulula.pass.lolaverse',
  },
  {
    id: 'pass-lola-craft',
    gameId: 'lola-craft',
    name: 'Builder Pro',
    benefits: ['Energía ilimitada', 'Pack de bloques neon', '2x XP'],
    pricePearls: 100,
    priceUsd: 2.49,
    sku: 'lulula.pass.lolacraft',
  },
  {
    id: 'pass-oink-us',
    gameId: 'oink-us',
    name: 'Detective Pack',
    benefits: ['Sombrero detective', 'Pista extra 1x/día', 'Emote sospechoso'],
    pricePearls: 80,
    priceUsd: 1.99,
    sku: 'lulula.pass.oinkus',
  },
  {
    id: 'pass-fall-oink',
    gameId: 'fall-oink',
    name: 'Crown Club',
    benefits: ['Skin corona', '1 revive gratis/match', '2x monedas'],
    pricePearls: 90,
    priceUsd: 2.49,
    sku: 'lulula.pass.falloink',
  },
  {
    id: 'pass-lola-run',
    gameId: 'lola-run',
    name: 'Runner Rush',
    benefits: ['Imán de monedas', '3 revives incluidos', 'Sin anuncios en-run'],
    pricePearls: 85,
    priceUsd: 1.99,
    sku: 'lulula.pass.lolarun',
  },
];

export const COSMETICS: CosmeticItem[] = [
  { id: 'skin-default', slot: 'skin', name: 'Lulula Clásica', priceCoins: 0, rarity: 'common', emoji: '🐷' },
  { id: 'skin-gold', slot: 'skin', name: 'Lulula Dorada', pricePearls: 150, rarity: 'legendary', emoji: '✨' },
  { id: 'skin-cyber', slot: 'skin', name: 'Lulula Cyber', priceCoins: 2500, rarity: 'rare', emoji: '🤖' },
  { id: 'hat-crown', slot: 'hat', name: 'Corona Oink', pricePearls: 60, rarity: 'rare', emoji: '👑' },
  { id: 'hat-devil', slot: 'hat', name: 'Cuernos Impostor', priceCoins: 800, rarity: 'common', emoji: '😈' },
  { id: 'trail-rainbow', slot: 'trail', name: 'Estela Arcoíris', pricePearls: 45, rarity: 'rare', emoji: '🌈' },
  { id: 'blocks-neon', slot: 'block-pack', name: 'Bloques Neon', pricePearls: 35, rarity: 'rare', emoji: '🟦' },
  { id: 'emote-oink', slot: 'emote', name: 'Oink Legendario', priceCoins: 500, rarity: 'common', emoji: '💬' },
];

export const AD_REWARD_COINS = 50;
export const DAILY_FREE_PEARLS = 5;
export const REVIVE_COST_PEARLS = 10;

export function getGamePass(gameId: ViralGameId): GamePass | undefined {
  return GAME_PASSES.find((p) => p.gameId === gameId);
}

export function getProduct(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}
