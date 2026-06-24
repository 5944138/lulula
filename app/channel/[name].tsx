import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EmojiBar from '@/components/EmojiBar';
import IRCMessageLine from '@/components/mirc/IRCMessageLine';
import MircInput from '@/components/mirc/MircInput';
import MircStatusBar from '@/components/mirc/MircStatusBar';
import MircWindow from '@/components/mirc/MircWindow';
import NickList from '@/components/mirc/NickList';
import WhatsAppConversationHeader from '@/components/whatsapp/WhatsAppConversationHeader';
import { WA } from '@/constants/whatsappTheme';
import { useGamification } from '@/context/GamificationContext';
import { useIRC } from '@/context/IRCContext';
import { MircColors } from '@/constants/theme';
import { decodeChannelKey } from '@/lib/irc/utils';

export default function ChannelScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const channelName = decodeChannelKey(name ?? '');
  const { nick, getChannel, sendChannel, markChannelRead, joinChannel } = useIRC();
  const { recordMessage } = useGamification();
  const [input, setInput] = useState('');

  const room = getChannel(channelName);

  useEffect(() => {
    if (channelName) {
      joinChannel(channelName);
      markChannelRead(channelName);
    }
  }, [channelName, joinChannel, markChannelRead]);

  useEffect(() => {
    markChannelRead(channelName);
  }, [room?.messages.length, channelName, markChannelRead]);

  if (!channelName) return null;

  const messages = room?.messages ?? [];
  const users = room?.users ?? [];

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendChannel(channelName, text);
    recordMessage();
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <View style={[styles.desktop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <WhatsAppConversationHeader
        title={channelName}
        subtitle={`${users.length} en línea · mIRC wire`}
        onBack={() => router.back()}
      />
      <MircWindow
        title={`${channelName} @ Libera`}
        onClose={() => router.back()}
        style={styles.window}>
        {room?.topic ? (
          <Text style={styles.topic} numberOfLines={2}>
            📌 {room.topic}
          </Text>
        ) : null}

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatArea}>
            <View style={styles.messagesPanel}>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <IRCMessageLine message={item} myNick={nick} />}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                showsVerticalScrollIndicator
              />
            </View>
            <NickList
              users={users}
              onUserPress={(userNick) => {
                if (userNick !== nick) {
                  router.push(`/query/${encodeURIComponent(userNick)}`);
                }
              }}
            />
          </View>

          <EmojiBar onPick={(e) => setInput((prev) => prev + e)} />
          <View style={styles.inputRow}>
            <Text style={styles.prompt}>{'>'}</Text>
            <MircInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              returnKeyType="send"
              autoCorrect={false}
              autoCapitalize="none"
              placeholder={`Mensaje en ${channelName} — /me para acciones`}
            />
          </View>

          <MircStatusBar
            left={`${channelName} | ${users.length} nicks`}
            right={nick}
          />
        </KeyboardAvoidingView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    flex: 1,
    backgroundColor: WA.panel,
    padding: 6,
  },
  window: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topic: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    backgroundColor: MircColors.cardDark,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: MircColors.borderDark,
  },
  chatArea: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 4,
    gap: 3,
  },
  messagesPanel: {
    flex: 1,
    backgroundColor: MircColors.chatBg,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
  },
  messageList: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  prompt: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: MircColors.neonPink,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    color: MircColors.text,
  },
});
