import { StyleSheet, Text, View } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  left: string;
  right?: string;
};

export default function MircStatusBar({ left, right }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.text} numberOfLines={1}>
          {left}
        </Text>
      </View>
      {right && (
        <View style={[styles.panel, styles.rightPanel]}>
          <Text style={styles.text} numberOfLines={1}>
            {right}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
    paddingTop: 2,
  },
  panel: {
    flex: 1,
    backgroundColor: MircColors.statusBar,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: MircColors.borderDark,
    borderLeftColor: MircColors.borderDark,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minHeight: 20,
  },
  rightPanel: {
    flex: 0,
    minWidth: 100,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.text,
  },
});
