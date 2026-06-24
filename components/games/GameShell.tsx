import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LolaCharacter from '@/components/brand/LolaCharacter';
import CurrencyBar from '@/components/games/CurrencyBar';
import type { ViralGame } from '@/constants/games/catalog';
import { getGamePass } from '@/constants/games/monetization';
import { MircColors } from '@/constants/theme';
import { useEconomy } from '@/context/EconomyContext';

type Props = {
  game: ViralGame;
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function GameShell({ game, children, scroll = true, style }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasGamePass, buyGamePass } = useEconomy();
  const pass = getGamePass(game.id);
  const vip = hasGamePass(game.id);

  const body = (
    <>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← SALIR</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{game.emoji} {game.title}</Text>
          <Text style={styles.inspired}>Estilo {game.inspiredBy}</Text>
        </View>
        <LolaCharacter size={48} mood={game.lolaMood} bounce />
      </View>

      <CurrencyBar />

      {!vip && pass && (
        <Pressable style={styles.passBanner} onPress={() => buyGamePass(game.id)}>
          <Text style={styles.passTitle}>🎫 {pass.name} — {pass.pricePearls} 💎</Text>
          <Text style={styles.passSub}>{pass.benefits.join(' · ')}</Text>
        </Pressable>
      )}
      {vip && <Text style={styles.vipBadge}>✨ GAME PASS ACTIVO — {game.passMultiplier}x monedas</Text>}

      <View style={[styles.content, style]}>{children}</View>
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MircColors.desktopDark,
    paddingHorizontal: 12,
  },
  scroll: { gap: 12, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  back: {
    padding: 6,
    backgroundColor: MircColors.windowBg,
    borderWidth: 2,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
  },
  backText: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.text,
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 18,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  inspired: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  passBanner: {
    backgroundColor: '#FF00AA22',
    borderWidth: 2,
    borderColor: MircColors.neonPink,
    padding: 10,
    gap: 4,
  },
  passTitle: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  passSub: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textLight,
  },
  vipBadge: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.neonGreen,
    fontWeight: 'bold',
  },
  content: { flex: 1, minHeight: 200 },
});
