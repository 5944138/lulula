import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { WA } from '@/constants/whatsappTheme';

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onInfo?: () => void;
};

/** Barra superior estilo WhatsApp — la conversación abre como WA, el chat es mIRC adentro */
export default function WhatsAppConversationHeader({ title, subtitle, onBack, onInfo }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.back} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={WA.textSecondary} />
      </Pressable>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="videocam" size={22} color={WA.textSecondary} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onInfo}>
          <Ionicons name="call" size={20} color={WA.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WA.header,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WA.border,
    gap: 4,
  },
  back: { padding: 8 },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 17, fontWeight: '600', color: WA.text },
  subtitle: { fontSize: 12, color: WA.teal, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16, paddingRight: 8 },
  iconBtn: { padding: 4 },
});
