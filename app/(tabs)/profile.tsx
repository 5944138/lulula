import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LululaLogo from '@/components/brand/LululaLogo';
import CurrencyBar from '@/components/games/CurrencyBar';
import InviteCard from '@/components/gamification/InviteCard';
import LevelBar from '@/components/gamification/LevelBar';
import StreakFlame from '@/components/gamification/StreakFlame';
import MircButton from '@/components/mirc/MircButton';
import MircWindow from '@/components/mirc/MircWindow';
import { BRAND, VIBE_STATUSES, WS_URL } from '@/constants/config';
import { MircColors } from '@/constants/theme';
import { useEconomy } from '@/context/EconomyContext';
import { getBadgeInfo, useGamification } from '@/context/GamificationContext';
import { useAuth } from '@/context/AuthContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';
import { getNickColor } from '@/lib/irc/utils';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityName, tribeName, tribeEmoji, clearIdentity } = useIdentity();
  const { logout } = useAuth();
  const { nick, vibe, serverName, statusMessage, setVibe, disconnect, channels, pms } = useIRC();
  const { streak, level, xp, levelProgress, badges, recordInvite } = useGamification();
  const { oinkCoins, pearls, battlePassActive } = useEconomy();

  const handleLogout = async () => {
    disconnect();
    await clearIdentity();
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MircWindow title="Perfil — Tu identidad digital" style={styles.window}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <LululaLogo size="sm" />
          <CurrencyBar />
          {battlePassActive && (
            <Text style={styles.bp}>🎫 Pase de Temporada activo</Text>
          )}

          <View style={styles.profileHeader}>
            <Image
              source={require('@/assets/images/lulula-mascot.png')}
              style={styles.mascot}
            />
            <Text style={[styles.nick, { color: getNickColor(nick) }]}>{nick}</Text>
            <Text style={styles.school}>{tribeEmoji} {tribeName} · {cityName}</Text>
            <Text style={styles.server}>{serverName}</Text>
            <Text style={styles.vibe}>{vibe}</Text>
          </View>

          <View style={styles.gamificationRow}>
            <StreakFlame streak={streak} size="sm" />
            <View style={styles.levelFlex}>
              <LevelBar level={level} progress={levelProgress} xp={xp} />
            </View>
          </View>

          {badges.length > 0 && (
            <View style={styles.badges}>
              <Text style={styles.sectionTitle}>Badges desbloqueados</Text>
              <View style={styles.badgeRow}>
                {badges.map((id) => {
                  const b = getBadgeInfo(id);
                  return (
                    <View key={id} style={styles.badge}>
                      <Text style={styles.badgeEmoji}>{b?.emoji}</Text>
                      <Text style={styles.badgeName}>{b?.name}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{oinkCoins}</Text>
              <Text style={styles.statLabel}>🪙</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{pearls}</Text>
              <Text style={styles.statLabel}>💎</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{channels.length}</Text>
              <Text style={styles.statLabel}>Salas</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{pms.length}</Text>
              <Text style={styles.statLabel}>DMs</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tu status (away message)</Text>
          <View style={styles.vibeList}>
            {VIBE_STATUSES.map((v) => (
              <Pressable
                key={v}
                style={[styles.vibeItem, vibe === v && styles.vibeItemActive]}
                onPress={() => setVibe(v)}>
                <Text style={[styles.vibeItemText, vibe === v && styles.vibeItemTextActive]}>
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>

          <InviteCard
            cityName={cityName}
            tribeName={tribeName}
            nick={nick}
            onShared={recordInvite}
          />

          <View style={styles.about}>
            <LululaLogo size="sm" />
            <Text style={styles.aboutText}>
              {BRAND.name} v{BRAND.version}{'\n'}
              {BRAND.tagline}{'\n\n'}
              Bridge: {WS_URL}{'\n'}
              {statusMessage}
            </Text>
          </View>

          <MircButton label="Desconectar" onPress={handleLogout} />
        </ScrollView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MircColors.desktop,
    padding: 8,
  },
  window: {
    flex: 1,
  },
  scroll: {
    padding: 8,
    gap: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  mascot: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#BF00FF',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 4,
    borderWidth: 3,
    backgroundColor: MircColors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'Courier',
    fontWeight: 'bold',
  },
  nick: {
    fontSize: 22,
    fontFamily: 'Courier',
    fontWeight: 'bold',
  },
  school: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    textAlign: 'center',
  },
  gamificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: MircColors.cardDark,
  },
  levelFlex: { flex: 1 },
  badges: { gap: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: MircColors.windowBg,
    borderWidth: 1,
    borderColor: MircColors.borderDark,
    minWidth: 72,
  },
  badgeEmoji: { fontSize: 22 },
  badgeName: { fontSize: 9, fontFamily: 'Courier', color: MircColors.text, textAlign: 'center' },
  server: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  vibe: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: MircColors.cardDark,
    padding: 12,
    borderWidth: 2,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 24,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.text,
  },
  vibeList: {
    gap: 6,
  },
  vibeItem: {
    padding: 10,
    backgroundColor: MircColors.inputBg,
    borderWidth: 1,
    borderColor: MircColors.borderDark,
  },
  vibeItemActive: {
    borderColor: MircColors.neonCyan,
    backgroundColor: '#00ffff11',
  },
  vibeItemText: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.text,
  },
  vibeItemTextActive: {
    color: MircColors.neonCyan,
    fontWeight: 'bold',
  },
  about: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: MircColors.cardDark,
  },
  aboutText: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  bp: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.neonGreen,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
