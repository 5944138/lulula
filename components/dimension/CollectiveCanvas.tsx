import { CANVAS_SIZE } from '@/constants/oinkDimension';
import type { CanvasGrid } from '@/constants/oinkDimension';
import { StyleSheet, Text, View } from 'react-native';

type Props = { grid: CanvasGrid; size?: number };

/** Cada mensaje IRC = un píxel en el universo colectivo */
export default function CollectiveCanvas({ grid, size = 280 }: Props) {
  const cell = size / CANVAS_SIZE;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={styles.scanlines} pointerEvents="none" />
      {grid.map((row, y) =>
        row.map((paint, x) => (
          <View
            key={`${x}-${y}`}
            style={[
              styles.pixel,
              {
                left: x * cell,
                top: y * cell,
                width: cell - 0.5,
                height: cell - 0.5,
                backgroundColor: paint ? paint.color + '33' : '#00000044',
              },
            ]}>
            {paint ? (
              <Text style={[styles.glyph, { fontSize: cell * 0.65, color: paint.color }]}>{paint.glyph}</Text>
            ) : null}
          </View>
        )),
      )}
      <View style={styles.frame} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: '#050508',
    borderWidth: 3,
    borderColor: '#FF00AA',
    alignSelf: 'center',
  },
  pixel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontWeight: '700' },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#fff',
    zIndex: 2,
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#00FFFF44',
    zIndex: 3,
  },
});
