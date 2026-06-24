import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  items: string[];
  onPress?: (item: string) => void;
};

export default function MircMenuBar({ items, onPress }: Props) {
  return (
    <View style={styles.bar}>
      {items.map((item) => (
        <Pressable key={item} style={styles.item} onPress={() => onPress?.(item)}>
          <Text style={styles.itemText}>
            <Text style={styles.underline}>{item[0]}</Text>
            {item.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: MircColors.windowBg,
    borderBottomWidth: 1,
    borderBottomColor: MircColors.borderDark,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  item: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemText: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.text,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
