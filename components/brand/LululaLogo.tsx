import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/config';
import { MircColors } from '@/constants/theme';

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
};

const SIZES = { sm: 56, md: 96, lg: 140, hero: 180 };

export default function LululaLogo({ size = 'md', showTagline = false }: Props) {
  const px = SIZES[size];

  return (
    <View style={styles.wrap}>
      <View style={[styles.glow, { width: px + 24, height: px + 24, borderRadius: (px + 24) / 2 }]} />
      <View style={[styles.iconFrame, { width: px + 12, height: px + 12, borderRadius: 16 }]}>
        <Image
          source={require('@/assets/images/lulula-mascot.png')}
          style={{ width: px, height: px, borderRadius: 12 }}
          resizeMode="cover"
        />
      </View>
      <LinearGradient
        colors={['#FF00AA', '#BF00FF', '#00FFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.nameGradient}>
        <Text style={[styles.name, size === 'hero' && styles.nameHero, size === 'lg' && styles.nameLg, size === 'sm' && styles.nameSm]}>
          {BRAND.name}
        </Text>
      </LinearGradient>
      {showTagline && <Text style={styles.tagline}>{BRAND.tagline}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
  },
  glow: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#FF00AA33',
    shadowColor: '#BF00FF',
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  iconFrame: {
    borderWidth: 3,
    borderTopColor: '#ff66cc',
    borderLeftColor: '#ff66cc',
    borderBottomColor: '#660066',
    borderRightColor: '#660066',
    backgroundColor: '#1a0a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    overflow: 'hidden',
  },
  nameGradient: {
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 32,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
    letterSpacing: 3,
  },
  nameHero: {
    fontSize: 42,
    letterSpacing: 5,
  },
  nameLg: {
    fontSize: 38,
    letterSpacing: 4,
  },
  nameSm: {
    fontSize: 20,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: MircColors.textLight,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
});
