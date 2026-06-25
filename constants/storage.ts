/** AsyncStorage keys — migrates from @lolaphone / @dialin */

const P = '@lulula';
const LEGACY_LOLA = '@lolaphone';
const LEGACY_DIAL = '@dialin';

export const STORAGE_KEYS = {
  nick: `${P}/nick`,
  vibe: `${P}/vibe`,
  joined: `${P}/joined`,
  city: `${P}/city`,
  tribe: `${P}/tribe`,
  onboarding: `${P}/onboardingDone`,
  phone: `${P}/phone`,
  authDone: `${P}/authDone`,
  displayName: `${P}/displayName`,
  phoneVerified: `${P}/phoneVerified`,
  sessionToken: `${P}/sessionToken`,
  oinkWavesPlayed: `${P}/oinkWavesPlayed`,
  oinkCanvas: `${P}/oinkCanvas`,
  wireLegends: `${P}/wireLegends`,
  cityMsgCount: `${P}/cityMsgCount`,
  snoutCastSessions: `${P}/snoutCastSessions`,
  glitchBanishes: `${P}/glitchBanishes`,
  signalHistory: `${P}/signalHistory`,
  signalsJoined: `${P}/signalsJoined`,
  mindStreak: `${P}/mindStreak`,
  mindResonances: `${P}/mindResonances`,
  mindConfessions: `${P}/mindConfessions`,
  xp: `${P}/xp`,
  streak: `${P}/streak`,
  lastDay: `${P}/lastDay`,
  badges: `${P}/badges`,
  msgs: `${P}/msgCount`,
  rooms: `${P}/roomsJoined`,
  invites: `${P}/invites`,
  dailyAnswered: `${P}/dailyDay`,
} as const;

export const LEGACY_KEYS = {
  nick: `${LEGACY_DIAL}/nick`,
  vibe: `${LEGACY_DIAL}/vibe`,
  joined: `${LEGACY_DIAL}/joined`,
  city: `${LEGACY_DIAL}/city`,
  tribe: `${LEGACY_DIAL}/tribe`,
  school: `${LEGACY_DIAL}/school`,
  onboarding: `${LEGACY_DIAL}/onboardingDone`,
  xp: `${LEGACY_DIAL}/xp`,
  streak: `${LEGACY_DIAL}/streak`,
  lastDay: `${LEGACY_DIAL}/lastDay`,
  badges: `${LEGACY_DIAL}/badges`,
  msgs: `${LEGACY_DIAL}/msgCount`,
  rooms: `${LEGACY_DIAL}/roomsJoined`,
  invites: `${LEGACY_DIAL}/invites`,
  dailyAnswered: `${LEGACY_DIAL}/dailyDay`,
} as const;

export const LEGACY_LOLAPHONE_KEYS = {
  nick: `${LEGACY_LOLA}/nick`,
  vibe: `${LEGACY_LOLA}/vibe`,
  joined: `${LEGACY_LOLA}/joined`,
  city: `${LEGACY_LOLA}/city`,
  tribe: `${LEGACY_LOLA}/tribe`,
  onboarding: `${LEGACY_LOLA}/onboardingDone`,
  xp: `${LEGACY_LOLA}/xp`,
  streak: `${LEGACY_LOLA}/streak`,
  lastDay: `${LEGACY_LOLA}/lastDay`,
  badges: `${LEGACY_LOLA}/badges`,
  msgs: `${LEGACY_LOLA}/msgCount`,
  rooms: `${LEGACY_LOLA}/roomsJoined`,
  invites: `${LEGACY_LOLA}/invites`,
  dailyAnswered: `${LEGACY_LOLA}/dailyDay`,
} as const;

export function pickMigrated(
  pairs: readonly (readonly [string, string | null])[],
  key: string,
  legacyKey: string,
) {
  const v = pairs.find(([k]) => k === key)?.[1];
  if (v != null) return v;
  return pairs.find(([k]) => k === legacyKey)?.[1] ?? null;
}

/** Try new key, then lolaphone, then dialin. */
export function pickMigratedChain(
  pairs: readonly (readonly [string, string | null])[],
  key: string,
  ...legacyKeys: string[]
) {
  const direct = pairs.find(([k]) => k === key)?.[1];
  if (direct != null) return direct;
  for (const lk of legacyKeys) {
    const v = pairs.find(([k]) => k === lk)?.[1];
    if (v != null) return v;
  }
  return null;
}
