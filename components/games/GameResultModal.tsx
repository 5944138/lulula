import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/config';
import { WA } from '@/constants/whatsappTheme';

type Props = {
  gameName: string;
  score: number;
  coinsEarned: number;
  onPlayAgain: () => void;
  onExit: () => void;
};

export default function GameResultModal({ gameName, score, coinsEarned, onPlayAgain, onExit }: Props) {
  const share = async () => {
    const msg =
      `🐷 ${BRAND.name} — acabo de hacer ${score} pts en ${gameName}!` +
      `\n+${coinsEarned} Oink Coins 🪙` +
      `\n¿Me ganas? lulula.app #Lulula #Viral`;
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.title}>¡Partida terminada!</Text>
        <Text style={styles.score}>{score} pts</Text>
        <Text style={styles.coins}>+{coinsEarned} Oink Coins</Text>

        <Pressable style={styles.primary} onPress={share}>
          <Text style={styles.primaryText}>📣 Compartir — hazlo viral</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={onPlayAgain}>
          <Text style={styles.secondaryText}>Jugar otra vez</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={onExit}>
          <Text style={styles.ghostText}>Volver al arcade</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000CC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: WA.header,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: WA.green,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: WA.text },
  score: { fontSize: 36, fontWeight: '800', color: WA.teal },
  coins: { fontSize: 16, color: WA.textSecondary, marginBottom: 12 },
  primary: {
    width: '100%',
    backgroundColor: WA.green,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondary: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 15, color: WA.teal, fontWeight: '600' },
  ghost: { paddingVertical: 8 },
  ghostText: { fontSize: 14, color: WA.textSecondary },
});
