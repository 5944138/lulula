import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { MircColors } from '@/constants/theme';

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
};

export default function RetroCard({
  emoji,
  title,
  subtitle,
  badge,
  onPress,
  style,
  selected,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
        style,
      ]}
      onPress={onPress}>
      {selected && (
        <LinearGradient
          colors={[`${MircColors.neonCyan}33`, `${MircColors.neonPink}22`]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MircColors.cardDark,
    borderWidth: 2,
    borderTopColor: MircColors.borderLight,
    borderLeftColor: MircColors.borderLight,
    borderBottomColor: MircColors.borderDarker,
    borderRightColor: MircColors.borderDarker,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: MircColors.neonCyan,
  },
  cardPressed: {
    borderTopColor: MircColors.borderDarker,
    borderLeftColor: MircColors.borderDarker,
    borderBottomColor: MircColors.borderLight,
    borderRightColor: MircColors.borderLight,
  },
  emoji: {
    fontSize: 28,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  badge: {
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
  },
});
