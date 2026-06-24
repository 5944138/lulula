import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { WA } from '@/constants/whatsappTheme';

type Props = {
  title?: string;
  onSearch?: (q: string) => void;
  searchValue?: string;
  rightAction?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

export default function WhatsAppChatHeader({
  title = 'Lulula',
  onSearch,
  searchValue = '',
  rightAction,
  rightIcon = 'ellipsis-vertical',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 4 }]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="camera-outline" size={22} color={WA.textSecondary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={rightAction}>
            <Ionicons name={rightIcon} size={22} color={WA.textSecondary} />
          </Pressable>
        </View>
      </View>
      {onSearch && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={WA.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            placeholderTextColor={WA.textSecondary}
            value={searchValue}
            onChangeText={onSearch}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: WA.header,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: WA.text,
  },
  actions: { flexDirection: 'row', gap: 20 },
  iconBtn: { padding: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: WA.inputBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: WA.text,
    padding: 0,
  },
});
