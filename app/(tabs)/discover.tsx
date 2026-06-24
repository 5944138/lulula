import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RetroCard from '@/components/brand/RetroCard';
import MircInput from '@/components/mirc/MircInput';
import MircWindow from '@/components/mirc/MircWindow';
import { CITIES, GLOBAL_CHANNELS } from '@/constants/world';
import { MircColors } from '@/constants/theme';
import { useIdentity } from '@/context/IdentityContext';
import { useGamification } from '@/context/GamificationContext';
import { useIRC } from '@/context/IRCContext';
import { channelKey, normalizeChannel } from '@/lib/irc/utils';

const EXTRA_ROOMS = [
  { name: GLOBAL_CHANNELS.lounge, emoji: '☕', tagline: 'Chill global hangout', vibe: 'Lounge' },
  { name: GLOBAL_CHANNELS.confessions, emoji: '🤫', tagline: 'Anonymous (but respectful)', vibe: 'Spicy' },
  { name: GLOBAL_CHANNELS.afterdark, emoji: '🌙', tagline: 'Late night energy', vibe: 'After dark' },
  { name: GLOBAL_CHANNELS.global, emoji: '🌍', tagline: 'The whole internet on Libera', vibe: 'Global' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityId } = useIdentity();
  const { joinChannel, channels } = useIRC();
  const { recordRoomJoin } = useGamification();
  const [customChannel, setCustomChannel] = useState('');

  const joined = new Set(channels.map((c) => c.name.toLowerCase()));

  const cityRooms = CITIES.map((c) => ({
    name: c.channel,
    emoji: c.emoji,
    tagline: c.vibe,
    vibe: c.id === cityId ? 'YOUR CITY' : 'City',
    highlight: c.id === cityId,
  }));

  type RoomItem = (typeof cityRooms)[number] | (typeof EXTRA_ROOMS)[number];

  const allRooms: RoomItem[] = [
    {
      name: GLOBAL_CHANNELS.world,
      emoji: '🌐',
      tagline: 'La línea principal de Lulula',
      vibe: 'HOME',
      highlight: true,
    },
    ...cityRooms,
    ...EXTRA_ROOMS,
  ];

  const handleJoin = (name: string) => {
    const ch = normalizeChannel(name);
    joinChannel(ch);
    recordRoomJoin();
    router.push(`/channel/${channelKey(ch)}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MircWindow title="Discover — Rooms on the Wire" style={styles.window}>
        <Text style={styles.subtitle}>
          Every city has a room. Find yours and bring your tribe 📣
        </Text>

        <View style={styles.customJoin}>
          <MircInput
            style={styles.customInput}
            value={customChannel}
            onChangeText={setCustomChannel}
            placeholder="#create-your-room"
            autoCapitalize="none"
            onSubmitEditing={() => customChannel && handleJoin(customChannel)}
          />
          <Text style={styles.customHint} onPress={() => customChannel && handleJoin(customChannel)}>
            [ENTER to join]
          </Text>
        </View>

        <FlatList
          data={allRooms}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RetroCard
              emoji={item.emoji}
              title={item.name}
              subtitle={item.tagline}
              badge={joined.has(item.name.toLowerCase()) ? 'IN' : item.vibe}
              selected={
                joined.has(item.name.toLowerCase()) ||
                ('highlight' in item && item.highlight === true)
              }
              onPress={() => handleJoin(item.name)}
            />
          )}
        />
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MircColors.desktop, padding: 8 },
  window: { flex: 1 },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textDim,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  customJoin: { marginBottom: 12, gap: 4 },
  customInput: { color: MircColors.text },
  customHint: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    textAlign: 'right',
  },
  list: { gap: 8, paddingBottom: 16 },
});
