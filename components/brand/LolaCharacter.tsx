import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LULULA, type LululaMood } from '@/constants/lulula';

type Props = {
  size?: number;
  mood?: LululaMood;
  bounce?: boolean;
  style?: ViewStyle;
};

/** Cerdita Lola — mascota vectorial en Views (sin assets externos). */
export default function LolaCharacter({ size = 96, mood = 'happy', bounce = false, style }: Props) {
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!bounce) return;
    bob.value = withRepeat(
      withSequence(withTiming(-4, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      true,
    );
  }, [bounce, bob]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  const s = size;
  const c = LULULA.colors;

  const leftEyeOpen = mood !== 'play';
  const rightEyeOpen = mood !== 'wink';
  const leftEyeClosed = mood === 'play';
  const rightEyeClosed = mood === 'wink' || mood === 'play';

  return (
    <Animated.View style={[styles.wrap, { width: s, height: s * 1.15 }, bounce && animStyle, style]}>
      <View
        style={[
          styles.ear,
          {
            width: s * 0.28,
            height: s * 0.32,
            backgroundColor: c.ear,
            borderRadius: s * 0.14,
            left: s * 0.08,
            top: s * 0.02,
            transform: [{ rotate: '-22deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.ear,
          {
            width: s * 0.28,
            height: s * 0.32,
            backgroundColor: c.ear,
            borderRadius: s * 0.14,
            right: s * 0.08,
            top: s * 0.02,
            transform: [{ rotate: '22deg' }],
          },
        ]}
      />

      <View
        style={{
          width: s * 0.88,
          height: s * 0.82,
          borderRadius: s * 0.44,
          backgroundColor: c.bodyLight,
          alignSelf: 'center',
          marginTop: s * 0.12,
          borderWidth: 2,
          borderColor: '#FF7EB388',
        }}
      />

      <View
        style={{
          position: 'absolute',
          width: s * 0.42,
          height: s * 0.3,
          borderRadius: s * 0.18,
          backgroundColor: c.snout,
          top: s * 0.52,
          alignSelf: 'center',
          borderWidth: 1.5,
          borderColor: '#FF8EC066',
        }}>
        <View style={styles.nostrilRow}>
          <View style={[styles.nostril, { width: s * 0.07, height: s * 0.09, borderRadius: s * 0.05 }]} />
          <View style={[styles.nostril, { width: s * 0.07, height: s * 0.09, borderRadius: s * 0.05 }]} />
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          width: s * 0.16,
          height: s * 0.1,
          borderRadius: s * 0.08,
          backgroundColor: c.blush,
          left: s * 0.1,
          top: s * 0.48,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: s * 0.16,
          height: s * 0.1,
          borderRadius: s * 0.08,
          backgroundColor: c.blush,
          right: s * 0.1,
          top: s * 0.48,
        }}
      />

      <Eye s={s} x={s * 0.26} y={s * 0.38} open={leftEyeOpen} closed={leftEyeClosed} c={c} />
      <Eye s={s} x={s * 0.58} y={s * 0.38} open={rightEyeOpen} closed={rightEyeClosed} c={c} />

      <View
        style={{
          position: 'absolute',
          width: s * 0.22,
          height: s * 0.1,
          borderBottomWidth: 2.5,
          borderLeftWidth: 2.5,
          borderRightWidth: 2.5,
          borderColor: c.eye,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: s * 0.12,
          borderBottomRightRadius: s * 0.12,
          top: s * 0.62,
          alignSelf: 'center',
          opacity: mood === 'think' ? 0.4 : 1,
        }}
      />

      <View
        style={{
          width: s * 0.72,
          height: s * 0.38,
          borderRadius: s * 0.2,
          backgroundColor: c.body,
          alignSelf: 'center',
          marginTop: -s * 0.06,
          borderWidth: 2,
          borderColor: '#FF7EB366',
        }}
      />

      {(mood === 'phone' || mood === 'excited') && (
        <View
          style={{
            position: 'absolute',
            right: s * 0.02,
            bottom: s * 0.08,
            width: s * 0.22,
            height: s * 0.34,
            borderRadius: 4,
            backgroundColor: '#1a1a2e',
            borderWidth: 2,
            borderColor: c.phone,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: s * 0.14,
              height: s * 0.14,
              borderRadius: s * 0.07,
              backgroundColor: c.phone,
              opacity: mood === 'excited' ? 1 : 0.7,
            }}
          />
        </View>
      )}

      {mood === 'play' && (
        <View
          style={{
            position: 'absolute',
            left: s * 0.04,
            bottom: s * 0.1,
            width: s * 0.26,
            height: s * 0.14,
            borderRadius: 8,
            backgroundColor: '#2D1B2E',
            borderWidth: 2,
            borderColor: '#FF00AA',
          }}
        />
      )}

      {mood === 'think' && (
        <View
          style={{
            position: 'absolute',
            right: -s * 0.06,
            top: s * 0.02,
            width: s * 0.2,
            height: s * 0.14,
            borderRadius: s * 0.08,
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            borderColor: '#FF00AA',
          }}
        />
      )}
    </Animated.View>
  );
}

function Eye({
  s,
  x,
  y,
  open,
  closed,
  c,
}: {
  s: number;
  x: number;
  y: number;
  open: boolean;
  closed: boolean;
  c: (typeof LULULA)['colors'];
}) {
  if (closed) {
    return (
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y + s * 0.04,
          width: s * 0.12,
          height: 2,
          backgroundColor: c.eye,
          borderRadius: 1,
        }}
      />
    );
  }

  if (!open) return null;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: s * 0.11,
          height: s * 0.13,
          borderRadius: s * 0.06,
          backgroundColor: c.eye,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: x + s * 0.025,
          top: y + s * 0.02,
          width: s * 0.04,
          height: s * 0.04,
          borderRadius: s * 0.02,
          backgroundColor: c.highlight,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
  },
  ear: {
    position: 'absolute',
  },
  nostrilRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  nostril: {
    backgroundColor: '#E86B9A',
  },
});
