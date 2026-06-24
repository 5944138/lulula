export type CityId =
  | 'tokyo'
  | 'nyc'
  | 'london'
  | 'cdmx'
  | 'seoul'
  | 'lagos'
  | 'berlin'
  | 'mumbai'
  | 'saopaulo'
  | 'paris'
  | 'dubai'
  | 'jakarta';

export type Tribe = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
};

export type City = {
  id: CityId;
  name: string;
  emoji: string;
  channel: string;
  vibe: string;
  timezone: string;
};

export const CITIES: City[] = [
  { id: 'tokyo', name: 'Tokyo', emoji: '🗼', channel: '#lulula-tokyo', vibe: 'Neon nights & pure energy', timezone: 'JST' },
  { id: 'nyc', name: 'New York', emoji: '🗽', channel: '#lulula-nyc', vibe: 'The city that never logs off', timezone: 'EST' },
  { id: 'london', name: 'London', emoji: '🇬🇧', channel: '#lulula-london', vibe: 'Tea, chaos & underground vibes', timezone: 'GMT' },
  { id: 'cdmx', name: 'Mexico City', emoji: '🌮', channel: '#lulula-cdmx', vibe: '24/7 culture & real talk', timezone: 'CST' },
  { id: 'seoul', name: 'Seoul', emoji: '🇰🇷', channel: '#lulula-seoul', vibe: 'K-culture meets late-night IRC', timezone: 'KST' },
  { id: 'lagos', name: 'Lagos', emoji: '🇳🇬', channel: '#lulula-lagos', vibe: 'Afrobeats & big dreams', timezone: 'WAT' },
  { id: 'berlin', name: 'Berlin', emoji: '🎧', channel: '#lulula-berlin', vibe: 'Techno, art & freedom', timezone: 'CET' },
  { id: 'mumbai', name: 'Mumbai', emoji: '🇮🇳', channel: '#lulula-mumbai', vibe: 'Bollywood to bytecode', timezone: 'IST' },
  { id: 'saopaulo', name: 'São Paulo', emoji: '🇧🇷', channel: '#lulula-saopaulo', vibe: 'Huge city, bigger personalities', timezone: 'BRT' },
  { id: 'paris', name: 'Paris', emoji: '🥐', channel: '#lulula-paris', vibe: 'Midnight philosophers', timezone: 'CET' },
  { id: 'dubai', name: 'Dubai', emoji: '🌆', channel: '#lulula-dubai', vibe: 'Future city, ancient soul', timezone: 'GST' },
  { id: 'jakarta', name: 'Jakarta', emoji: '🇮🇩', channel: '#lulula-jakarta', vibe: 'Island energy, global reach', timezone: 'WIB' },
];

/** Tribes = cómo te identificas en la red (reemplaza "escuela") */
export const TRIBES: Tribe[] = [
  { id: 'gamers', name: 'Gamers', emoji: '🎮', tagline: 'GG WP — ranked & chill' },
  { id: 'music', name: 'Music Heads', emoji: '🎵', tagline: 'What are you listening to?' },
  { id: 'devs', name: 'Devs & Builders', emoji: '💻', tagline: 'Code, ship, repeat' },
  { id: 'artists', name: 'Creators', emoji: '🎨', tagline: 'Art, edits & aesthetics' },
  { id: 'night', name: 'Night Owls', emoji: '🌙', tagline: '3AM is our golden hour' },
  { id: 'chaos', name: 'Chaos Agents', emoji: '💀', tagline: 'Unfiltered energy only' },
  { id: 'study', name: 'Study Grind', emoji: '📚', tagline: 'Homework help & focus' },
  { id: 'flirt', name: 'Vibe Check', emoji: '👀', tagline: 'Meet people, no cringe' },
  { id: 'sports', name: 'Sports Fanatics', emoji: '⚽', tagline: 'Match day every day' },
  { id: 'anime', name: 'Anime & Manga', emoji: '⛩️', tagline: 'Your people are here' },
  { id: 'crypto', name: 'Crypto & Finance', emoji: '📈', tagline: 'Not financial advice tho' },
  { id: 'mystery', name: 'Just Browsing', emoji: '👻', tagline: 'No label, pure explorer' },
];

export const GLOBAL_CHANNELS = {
  world: '#lulula-world',
  lounge: '#lulula-lounge',
  sala3pm: '#sala3pm',
  confessions: '#confessions',
  afterdark: '#afterdark',
  global: '##chat',
};

export const CITY_CHANNELS = (cityId: CityId) => {
  const city = CITIES.find((c) => c.id === cityId)!;
  return [city.channel, GLOBAL_CHANNELS.world, GLOBAL_CHANNELS.lounge, GLOBAL_CHANNELS.sala3pm];
};

export const DAILY_QUESTIONS = [
  'What song is on repeat in your head right now?',
  'Hot take: go.',
  'What\'s the best food in your city?',
  'Android or iPhone — fight in the chat.',
  'Confess something (keep it PG).',
  'Who would you trust with your password?',
  'What\'s your 3AM activity?',
  'Netflix or TikTok until you pass out?',
  'Best meme format of the year?',
  'If you could teleport anywhere right now?',
  'What\'s overrated on social media?',
  'Describe your vibe in 3 emojis.',
  'First crush energy — no names required.',
  'What skill are you learning this month?',
  'City rivalry: defend your hometown.',
  'AI helped you cheat on homework? Be honest.',
  'What\'s your toxic trait (funny version)?',
  'Playlist swap — drop your genre.',
  'Weekend plans in one sentence.',
  'What app would you delete forever?',
  'Dream job at 25?',
  'Spill the tea from your group chat.',
  'What makes a room feel alive?',
  'Would you go offline for a week?',
  'Your city vs the internet — who wins?',
  'Best advice you got this year?',
  'What\'s your Roman Empire obsession?',
  'Rank: sleep, friends, grades, fame.',
  'If Lulula had a theme song?',
  'Why are you here tonight?',
];

export function getDailyQuestion(): { question: string; dayIndex: number } {
  const start = new Date('2026-01-01').getTime();
  const dayIndex = Math.floor((Date.now() - start) / 86400000) % DAILY_QUESTIONS.length;
  return { question: DAILY_QUESTIONS[dayIndex], dayIndex };
}

export function isSala3pmOpen(): boolean {
  const h = new Date().getHours();
  return h >= 15 && h < 23;
}

export function getCity(id: CityId): City {
  return CITIES.find((c) => c.id === id)!;
}

export function getTribe(tribeId: string): Tribe | undefined {
  return TRIBES.find((t) => t.id === tribeId);
}

export const INVITE_MESSAGE = (city: string, tribe: string, nick: string) =>
  `✨ Lulula — la cerdita viral\n` +
  `📍 ${city} · ${tribe}\n` +
  `Chat en vivo + arcade adictivo.\n` +
  `Mi nick: ${nick}\n` +
  `lulula.app\n` +
  `#Lulula #Viral #Oink`;

export const BADGES = [
  { id: 'first-connect', name: 'First Call', emoji: '📞', xp: 0 },
  { id: 'streak-3', name: 'On Fire x3', emoji: '🔥', xp: 50 },
  { id: 'streak-7', name: 'Week Warrior', emoji: '💥', xp: 150 },
  { id: 'streak-30', name: 'Wire Legend', emoji: '👑', xp: 500 },
  { id: 'msgs-50', name: 'Chatterbox', emoji: '💬', xp: 100 },
  { id: 'msgs-200', name: 'Signal Boost', emoji: '📡', xp: 300 },
  { id: 'rooms-5', name: 'Explorer', emoji: '🧭', xp: 80 },
  { id: 'invite-3', name: 'Recruiter', emoji: '📣', xp: 120 },
  { id: 'sala3pm', name: 'Sala 3PM', emoji: '🕒', xp: 40 },
  { id: 'daily-7', name: 'Vibe Checker', emoji: '✅', xp: 70 },
] as const;

export type BadgeId = (typeof BADGES)[number]['id'];

export const XP_PER_MESSAGE = 12;
export const XP_DAILY_BONUS = 50;
export const XP_LEVEL_STEP = 100;

/** Rivalidades globales para el tab Pulso */
export const CITY_RIVALS: Partial<Record<CityId, CityId>> = {
  tokyo: 'seoul',
  seoul: 'tokyo',
  nyc: 'london',
  london: 'nyc',
  paris: 'berlin',
  berlin: 'paris',
  mumbai: 'dubai',
  dubai: 'mumbai',
  saopaulo: 'cdmx',
  cdmx: 'saopaulo',
};
