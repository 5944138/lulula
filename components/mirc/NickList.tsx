import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getUserColor, getUserPrefix } from '@/lib/irc/utils';
import type { IRCUser as IRCUserType } from '@/lib/irc/types';
import { MircColors } from '@/constants/theme';

type Props = {
  users: IRCUserType[];
  onUserPress?: (nick: string) => void;
};

export default function NickList({ users, onUserPress }: Props) {
  const sorted = [...users].sort((a, b) => {
    const modeOrder = { op: 0, halfop: 1, voice: 2, normal: 3 };
    const diff = modeOrder[a.mode] - modeOrder[b.mode];
    if (diff !== 0) return diff;
    return a.nick.localeCompare(b.nick);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Nicks: {users.length}</Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator>
        {sorted.map((user) => (
          <Pressable key={user.nick} onPress={() => onUserPress?.(user.nick)}>
            <Text style={[styles.nick, { color: getUserColor(user.mode) }]}>
              {getUserPrefix(user.mode)}
              {user.nick}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    backgroundColor: MircColors.inputBg,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
  },
  header: {
    backgroundColor: MircColors.windowBg,
    borderBottomWidth: 1,
    borderBottomColor: MircColors.borderDark,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  headerText: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textDim,
  },
  list: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  nick: {
    fontSize: 12,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
});
