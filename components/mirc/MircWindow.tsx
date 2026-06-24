import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  title: string;
  active?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function MircWindow({ title, active = true, onClose, children, style }: Props) {
  return (
    <View style={[styles.outer, style]}>
      <View style={[styles.titleBar, active ? styles.titleActive : styles.titleInactive]}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.titleButtons}>
          <Pressable style={styles.titleBtn} onPress={onClose}>
            <Text style={styles.titleBtnText}>_</Text>
          </Pressable>
          <Pressable style={styles.titleBtn}>
            <Text style={styles.titleBtnText}>□</Text>
          </Pressable>
          <Pressable style={styles.titleBtn} onPress={onClose}>
            <Text style={styles.titleBtnText}>×</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.client}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    borderColor: MircColors.borderDark,
    backgroundColor: MircColors.windowBg,
    flex: 1,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 3,
    minHeight: 22,
  },
  titleActive: {
    backgroundColor: MircColors.titleActive,
  },
  titleInactive: {
    backgroundColor: MircColors.titleInactive,
  },
  titleText: {
    flex: 1,
    color: MircColors.titleText,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  titleButtons: {
    flexDirection: 'row',
    gap: 2,
  },
  titleBtn: {
    width: 18,
    height: 16,
    backgroundColor: MircColors.buttonFace,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: MircColors.text,
    lineHeight: 12,
    marginTop: -2,
  },
  client: {
    flex: 1,
    padding: 3,
  },
});
