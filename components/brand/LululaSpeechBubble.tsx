import { StyleSheet, Text, View, Image } from 'react-native';

import { LULULA, type LululaMood } from '@/constants/lulula';
import { MircColors } from '@/constants/theme';

type Props = {
  line: string;
  mood?: LululaMood;
  size?: number;
};

export default function LululaSpeechBubble({ line, size = 72 }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={require('@/assets/images/lulula-mascot.png')}
        style={{ width: size, height: size, borderRadius: size * 0.2 }}
      />
      <View style={styles.bubble}>
        <Text style={styles.name}>{LULULA.name}</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#BF00FF',
  },
  line: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: MircColors.text,
    lineHeight: 18,
  },
});
