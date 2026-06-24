import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { QUICK_EMOJIS } from '@/constants/config';
import { MircColors } from '@/constants/theme';

type Props = {
  onPick: (emoji: string) => void;
};

export default function EmojiBar({ onPick }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bar}>
      {QUICK_EMOJIS.map((e) => (
        <Pressable key={e} style={styles.chip} onPress={() => onPick(e)}>
          <Text style={styles.emoji}>{e}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    maxHeight: 44,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 4,
    backgroundColor: MircColors.windowBg,
    borderWidth: 1,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
  },
  emoji: { fontSize: 20 },
});
