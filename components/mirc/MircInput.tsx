import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { MircColors } from '@/constants/theme';

export default function MircInput(props: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={MircColors.textDim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: MircColors.inputBg,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  input: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.text,
    minHeight: 22,
    padding: 0,
  },
});
