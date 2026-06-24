import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { WA } from '@/constants/whatsappTheme';

type Props = {
  title: string;
  subtitle?: string;
  time?: string;
  unread?: number;
  pinned?: boolean;
  online?: boolean;
  onPress?: () => void;
  avatarEmoji?: string;
  useMascot?: boolean;
};

export default function WhatsAppChatRow({
  title,
  subtitle,
  time,
  unread = 0,
  pinned,
  online,
  onPress,
  avatarEmoji,
  useMascot,
}: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatarWrap}>
        {useMascot ? (
          <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{avatarEmoji ?? '💬'}</Text>
          </View>
        )}
        {online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.title} numberOfLines={1}>
            {pinned ? '📌 ' : ''}
            {title}
          </Text>
          {time ? <Text style={[styles.time, unread > 0 && styles.timeUnread]}>{time}</Text> : null}
        </View>
        <View style={styles.bottom}>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    backgroundColor: WA.panel,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WA.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: WA.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: WA.green,
  },
  avatarEmoji: { fontSize: 24 },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: WA.teal,
    borderWidth: 2,
    borderColor: WA.panel,
  },
  body: { flex: 1, justifyContent: 'center', gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: WA.text,
    marginRight: 8,
  },
  time: { fontSize: 12, color: WA.textSecondary },
  timeUnread: { color: WA.teal },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subtitle: { flex: 1, fontSize: 14, color: WA.textSecondary },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: WA.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
