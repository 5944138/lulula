import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MircColors } from '@/constants/theme';

type Props = {
  active?: boolean;
  size?: number;
};

export default function LivePulse({ active = false, size = 14 }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      opacity.value = 0.4;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
    );
  }, [active, scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: active ? 1 : 0.35,
  }));

  return (
    <View style={[styles.wrap, { width: size * 2, height: size * 2 }]}>
      {active && (
        <Animated.View
          style={[
            styles.ring,
            { width: size * 2, height: size * 2, borderRadius: size },
            ringStyle,
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: active ? MircColors.neonGreen : MircColors.textMuted,
          },
          dotStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: MircColors.neonGreen,
  },
  dot: {},
});
