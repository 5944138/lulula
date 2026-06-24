import { useRouter, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import LululaSpeechBubble from '@/components/brand/LululaSpeechBubble';
import GameShell from '@/components/games/GameShell';
import ViralGameCard from '@/components/games/ViralGameCard';
import { getViralGame, VIRAL_GAMES, WIRE_CHAT } from '@/constants/games/catalog';
import { MircColors } from '@/constants/theme';

/** Hub estilo Roblox — portal a todos los mundos */
export default function LolaVerseScreen() {
  const router = useRouter();
  const game = getViralGame('lola-verse')!;

  const worlds = VIRAL_GAMES.filter((g) => g.id !== 'lola-verse');

  return (
    <GameShell game={game} scroll>
      <LululaSpeechBubble line="¡Bienvenido al Verse! Elige un mundo y invita a tus compas." size={56} />

      <Text style={styles.section}>🌍 Mundos populares</Text>
      <FlatList
        data={worlds}
        scrollEnabled={false}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ViralGameCard game={item} onPress={() => router.push(item.route as Href)} />
        )}
      />

      <Pressable style={styles.chatPortal} onPress={() => router.push(WIRE_CHAT.route as '/(tabs)/chats')}>
        <Text style={styles.chatTitle}>{WIRE_CHAT.emoji} {WIRE_CHAT.title}</Text>
        <Text style={styles.chatSub}>{WIRE_CHAT.subtitle}</Text>
      </Pressable>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
    marginTop: 8,
  },
  list: { gap: 10 },
  chatPortal: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#00ffff11',
    borderWidth: 2,
    borderColor: MircColors.neonCyan,
  },
  chatTitle: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  chatSub: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    marginTop: 4,
  },
});
