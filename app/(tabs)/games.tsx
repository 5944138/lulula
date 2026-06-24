import { useRouter, type Href } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LululaLogo from '@/components/brand/LululaLogo';
import LululaSpeechBubble from '@/components/brand/LululaSpeechBubble';
import CurrencyBar from '@/components/games/CurrencyBar';
import ViralGameCard from '@/components/games/ViralGameCard';
import MircWindow from '@/components/mirc/MircWindow';
import { VIRAL_GAMES, WIRE_CHAT } from '@/constants/games/catalog';
import { getDailyGreeting, LULULA } from '@/constants/lulula';
import { MircColors } from '@/constants/theme';

export default function GamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const greeting = getDailyGreeting();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MircWindow title="Arcade Lulula" style={styles.window}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LululaLogo size="md" showTagline />
          <CurrencyBar />
          <LululaSpeechBubble line={greeting} size={72} />

          <Text style={styles.intro}>
            {LULULA.name} te acompaña en cada juego. Inspirados en lo que está en tendencia — con economía
            Oink Coins 💎 y Game Passes.
          </Text>

          <Text style={styles.section}>🔥 Viral Arcade (5 juegos)</Text>
          <FlatList
            data={VIRAL_GAMES}
            scrollEnabled={false}
            keyExtractor={(g) => g.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ViralGameCard game={item} onPress={() => router.push(item.route as Href)} />
            )}
          />

          <Text style={styles.section}>📞 Social (aparte del arcade)</Text>
          <Pressable
            style={styles.chatCard}
            onPress={() => router.push(WIRE_CHAT.route as '/(tabs)/chats')}>
            <Text style={styles.chatTitle}>{WIRE_CHAT.emoji} {WIRE_CHAT.title}</Text>
            <Text style={styles.chatSub}>{WIRE_CHAT.subtitle}</Text>
            <Text style={styles.chatLine}>"{WIRE_CHAT.lolaLine}"</Text>
          </Pressable>
        </ScrollView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MircColors.desktop, padding: 8 },
  window: { flex: 1 },
  scroll: { gap: 12, paddingBottom: 32 },
  intro: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    lineHeight: 18,
  },
  section: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
    marginTop: 4,
  },
  list: { gap: 10 },
  chatCard: {
    padding: 14,
    backgroundColor: '#00ffff11',
    borderWidth: 2,
    borderColor: MircColors.neonCyan,
    gap: 4,
  },
  chatTitle: {
    fontSize: 15,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  chatSub: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textLight },
  chatLine: { fontSize: 10, fontFamily: 'Courier', color: MircColors.textMuted, fontStyle: 'italic' },
});
