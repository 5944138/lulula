import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function MircButton({ label, onPress, style }: Props) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: MircColors.buttonFace,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 75,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.text,
  },
});
