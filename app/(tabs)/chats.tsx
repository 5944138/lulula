import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import WhatsAppChatHeader from '@/components/whatsapp/WhatsAppChatHeader';
import WhatsAppChatRow from '@/components/whatsapp/WhatsAppChatRow';
import WireHero from '@/components/wire/WireHero';
import { VIRAL_GAMES } from '@/constants/games/catalog';
import { WA } from '@/constants/whatsappTheme';
import { getCity, GLOBAL_CHANNELS } from '@/constants/world';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';
import { useOinkDimension } from '@/context/OinkDimensionContext';
import { useSnoutCast } from '@/context/SnoutCastContext';
import { useGlitchPig } from '@/context/GlitchPigContext';
import { useCollectiveMind } from '@/context/CollectiveMindContext';
import { useOinkSignal } from '@/context/OinkSignalContext';
import { channelKey } from '@/lib/irc/utils';

function formatTime(time?: string) {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return time;
}

type ChatListItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  unread: number;
  pinned?: boolean;
  online?: boolean;
  avatarEmoji?: string;
  useMascot?: boolean;
  onPress: () => void;
};

export default function ChatsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { channels, pms, joinChannel, getChannel } = useIRC();
  const { cityId } = useIdentity();
  const { filled, possession } = useOinkDimension();
  const { active: snoutLive, broadcaster } = useSnoutCast();
  const { phase: glitchPhase, oracle } = useGlitchPig();
  const { phase: mindPhase, desire, progress, secLeft, openArena } = useCollectiveMind();
  const { phase: signalPhase, secLeft: signalSec, openDrop } = useOinkSignal();
  const city = cityId ? getCity(cityId) : null;

  const pinned = useMemo((): ChatListItem[] => {
    const rows: ChatListItem[] = [];
    if (signalPhase === 'countdown' || signalPhase === 'live') {
      rows.push({
        id: 'signal',
        title: '📡 SEÑAL OINK',
        subtitle:
          signalPhase === 'live'
            ? `UNA palabra en IRC · ${signalSec}s — el planeta escucha`
            : `La señal llega en ${signalSec}s — no te la pierdas`,
        time: 'DROP',
        unread: 1,
        avatarEmoji: '📡',
        pinned: true,
        online: true,
        onPress: () => openDrop(),
      });
    }
    if (mindPhase === 'active' || mindPhase === 'whisper') {
      rows.push({
        id: 'collective-mind',
        title: `${desire.emoji} MENTE COLECTIVA`,
        subtitle: `${desire.label} · ${secLeft}s · ${progress}/100 — el mundo te necesita en IRC`,
        time: 'LIVE',
        unread: 1,
        avatarEmoji: desire.emoji,
        pinned: true,
        online: true,
        onPress: () => openArena(),
      });
    }
    if (glitchPhase === 'invaded') {
      rows.push({
        id: 'glitch',
        title: '👾 CERDO GLITCH',
        subtitle: '¡Tu ciudad debe escribir L-U-L-U-L-A en el IRC!',
        time: 'ALERTA',
        unread: 1,
        avatarEmoji: '👾',
        pinned: true,
        onPress: () => router.push('/glitch-pig' as '/games/lola-run'),
      });
    }
    rows.push({
      id: 'snoutcast',
      title: snoutLive ? `🎙️ EN VIVO · ${broadcaster}` : '🎙️ SnoutCast',
      subtitle: snoutLive
        ? 'Radio pirata de tu ciudad — tap para entrar'
        : 'Escribe /hog en tu sala y toma el aire 90s',
      time: snoutLive ? 'LIVE' : 'ÚNICO',
      unread: snoutLive ? 1 : 0,
      avatarEmoji: '🎙️',
      pinned: true,
      online: snoutLive,
      onPress: () => router.push('/snoutcast' as '/games/lola-run'),
    });
    rows.push({
      id: 'dimension',
      title: '🌀 La Dimensión Oink',
      subtitle: possession.active
        ? '👁 Lulula te posee — entra ahora'
        : `${filled} px · 🔮 ${oracle.slice(0, 40)}…`,
      time: 'ÚNICO',
      unread: possession.active ? 1 : 0,
      avatarEmoji: '🌀',
      pinned: true,
      onPress: () => router.push('/dimension' as '/games/lola-run'),
    });
    rows.push({
      id: 'lulula',
      title: 'Lulula',
      subtitle: 'Tips virales · arcade · rachas',
      time: '',
      unread: 0,
      useMascot: true,
      pinned: true,
      onPress: () => router.push('/(tabs)/games'),
    });
    if (city) {
      const room = getChannel(city.channel);
      const last = room?.messages[room.messages.length - 1];
      rows.push({
        id: city.channel,
        title: city.name,
        subtitle: last?.text || `${room?.users.length ?? 0} en línea · tu ciudad`,
        time: formatTime(last?.time),
        unread: room?.unread ?? 0,
        avatarEmoji: city.emoji,
        online: (room?.users.length ?? 0) > 0,
        onPress: () => {
          joinChannel(city.channel);
          router.push(`/channel/${channelKey(city.channel)}`);
        },
      });
    }
    const global = getChannel(GLOBAL_CHANNELS.global);
    const glast = global?.messages[global.messages.length - 1];
    rows.push({
      id: GLOBAL_CHANNELS.global,
      title: '##chat — Mundo',
      subtitle: glast?.text || 'Siempre hay gente · IRC real',
      time: formatTime(glast?.time),
      unread: global?.unread ?? 0,
      avatarEmoji: '🌍',
      online: true,
      onPress: () => {
        joinChannel(GLOBAL_CHANNELS.global);
        router.push(`/channel/${channelKey(GLOBAL_CHANNELS.global)}`);
      },
    });
    return rows;
  }, [city, getChannel, joinChannel, router, filled, possession.active, snoutLive, broadcaster, glitchPhase, oracle, mindPhase, desire, progress, secLeft, openArena, signalPhase, signalSec, openDrop]);

  const joinCity = () => {
    if (!city) return;
    joinChannel(city.channel);
    router.push(`/channel/${channelKey(city.channel)}`);
  };

  const dynamic = useMemo((): ChatListItem[] => {
    const ch = channels
      .filter((c) => !pinned.some((p) => p.id === c.name))
      .map((c) => {
        const last = c.messages[c.messages.length - 1];
        return {
          id: c.name,
          title: c.name,
          subtitle: last?.text || c.topic || `${c.users.length} en línea`,
          time: formatTime(last?.time),
          unread: c.unread,
          avatarEmoji: '📡',
          online: c.users.length > 0,
          onPress: () => router.push(`/channel/${channelKey(c.name)}`),
        };
      });
    const pm = pms.map((p) => {
      const last = p.messages[p.messages.length - 1];
      return {
        id: `pm-${p.nick}`,
        title: p.nick,
        subtitle: last?.text || 'Mensaje privado',
        time: formatTime(last?.time),
        unread: p.unread,
        avatarEmoji: '💌',
        onPress: () => router.push(`/query/${encodeURIComponent(p.nick)}`),
      };
    });
    return [...ch, ...pm];
  }, [channels, pms, pinned, router]);

  const arcade = useMemo((): ChatListItem[] =>
      VIRAL_GAMES.slice(0, 3).map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: g.subtitle,
        time: 'JUEGO',
        unread: 0,
        avatarEmoji: g.emoji,
        onPress: () => router.push(g.route as '/games/lola-run'),
      })),
    [router],
  );

  const all = useMemo((): ChatListItem[] => {
    const q = search.toLowerCase();
    const list = [...pinned, ...arcade, ...dynamic];
    if (!q) return list;
    return list.filter((x) => x.title.toLowerCase().includes(q) || x.subtitle.toLowerCase().includes(q));
  }, [pinned, arcade, dynamic, search]);

  return (
    <View style={styles.root}>
      <WhatsAppChatHeader
        title="El Wire"
        onSearch={setSearch}
        searchValue={search}
        rightAction={() => router.push('/(tabs)/profile')}
      />

      <WireHero onJoinCity={joinCity} />

      <FlatList
        data={all}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={null}
        renderItem={({ item }) => (
          <WhatsAppChatRow
            title={item.title}
            subtitle={item.subtitle}
            time={item.time}
            unread={item.unread}
            pinned={item.pinned}
            online={item.online}
            avatarEmoji={item.avatarEmoji}
            useMascot={item.useMascot}
            onPress={item.onPress}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Conectando salas…</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/discover')}>
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WA.panel },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: WA.textSecondary },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WA.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
