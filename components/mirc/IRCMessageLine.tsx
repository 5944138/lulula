import { StyleSheet, Text, View } from 'react-native';

import { getNickColor } from '@/lib/irc/utils';
import type { IRCMessage } from '@/lib/irc/types';
import { MircColors } from '@/constants/theme';

type Props = {
  message: IRCMessage;
  myNick?: string;
  onAirNick?: string | null;
};

export default function IRCMessageLine({ message, myNick, onAirNick }: Props) {
  const { time, type, nick, text } = message;

  if (type === 'chat' && nick) {
    const isMe = message.fromMe || nick === myNick;
    const isOnAir = onAirNick && nick === onAirNick;
    return (
      <View style={[styles.line, isOnAir && styles.onAirLine]}>
        <Text style={styles.time}>[{time}]</Text>
        {isOnAir && <Text style={styles.onAirBadge}>🎙️</Text>}
        <Text style={styles.bracket}> {'<'}</Text>
        <Text
          style={[
            styles.nick,
            { color: isOnAir ? '#FFAA00' : isMe ? MircColors.neonPink : getNickColor(nick) },
          ]}>
          {nick}
        </Text>
        <Text style={styles.bracket}>{'>'} </Text>
        <Text style={styles.body}>{text}</Text>
      </View>
    );
  }

  if (type === 'action' && nick) {
    return (
      <View style={styles.line}>
        <Text style={styles.time}>[{time}]</Text>
        <Text style={styles.action}> * {nick} {text}</Text>
      </View>
    );
  }

  const color =
    type === 'join'
      ? MircColors.join
      : type === 'part' || type === 'quit'
        ? MircColors.part
        : type === 'notice'
          ? MircColors.notice
          : MircColors.server;

  return (
    <View style={styles.line}>
      <Text style={styles.time}>[{time}]</Text>
      <Text style={[styles.system, { color }]}> {text.startsWith('***') ? text : `*** ${text}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  bracket: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.textLight,
  },
  nick: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: 'bold',
  },
  body: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.textLight,
    flexShrink: 1,
  },
  action: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.action,
    fontStyle: 'italic',
    flexShrink: 1,
  },
  system: {
    fontSize: 12,
    fontFamily: 'Courier',
    flexShrink: 1,
  },
  onAirLine: {
    backgroundColor: '#FFAA0018',
    borderLeftWidth: 3,
    borderLeftColor: '#FFAA00',
    paddingLeft: 4,
  },
  onAirBadge: { fontSize: 11, marginRight: 2 },
});
