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

import IRCMessageLine from '@/components/mirc/IRCMessageLine';
import MircInput from '@/components/mirc/MircInput';
import MircStatusBar from '@/components/mirc/MircStatusBar';
import MircWindow from '@/components/mirc/MircWindow';
import { useGamification } from '@/context/GamificationContext';
import { useIRC } from '@/context/IRCContext';
import { MircColors } from '@/constants/theme';

export default function QueryScreen() {
  const { nick: nickParam } = useLocalSearchParams<{ nick: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const targetNick = decodeURIComponent(nickParam ?? '');
  const { nick, getPM, sendPM, markPMRead } = useIRC();
  const { recordMessage } = useGamification();
  const [input, setInput] = useState('');

  const room = getPM(targetNick);

  useEffect(() => {
    if (targetNick) markPMRead(targetNick);
  }, [targetNick, markPMRead, room?.messages.length]);

  if (!targetNick) return null;

  const messages = room?.messages ?? [];

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendPM(targetNick, text);
    recordMessage();
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <View style={[styles.desktop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <MircWindow
        title={`Query: ${targetNick}`}
        onClose={() => router.back()}
        style={styles.window}>
        <Text style={styles.hint}>💌 Mensaje privado — solo tú y {targetNick}</Text>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.messagesPanel}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <IRCMessageLine message={item} myNick={nick} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  *** Ahora hablas en privado con {targetNick}. ¡Sé respetuoso!
                </Text>
              }
            />
          </View>

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
              placeholder={`DM a ${targetNick}...`}
            />
          </View>

          <MircStatusBar left={`Query con ${targetNick}`} right={nick} />
        </KeyboardAvoidingView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    flex: 1,
    backgroundColor: MircColors.desktop,
    padding: 6,
  },
  window: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  hint: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.neonPink,
    padding: 6,
    backgroundColor: MircColors.cardDark,
  },
  messagesPanel: {
    flex: 1,
    backgroundColor: MircColors.chatBg,
    borderWidth: 2,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
    marginBottom: 4,
  },
  messageList: {
    padding: 8,
    flexGrow: 1,
  },
  empty: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    fontStyle: 'italic',
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
