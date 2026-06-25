import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { SNOUTCAST_SHARE } from '@/constants/snoutCast';
import { BRAND } from '@/constants/config';
import { useIdentity } from '@/context/IdentityContext';
import { useSnoutCast } from '@/context/SnoutCastContext';
import { WA } from '@/constants/whatsappTheme';

/** Modal al terminar una transmisión */
export default function SnoutCastEndCard() {
  const { cityName } = useIdentity();
  const { lastEnd, dismissEnd } = useSnoutCast();

  if (!lastEnd) return null;

  const share = async () => {
    const msg = SNOUTCAST_SHARE(
      cityName,
      lastEnd.broadcaster,
      lastEnd.oinkReactions,
      lastEnd.listeners,
    );
    try {
      await Share.share({ message: msg, title: BRAND.name });
    } catch {
      /* noop */
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎙️</Text>
        <Text style={styles.title}>
          {lastEnd.wasYou ? '¡Cerraste el aire!' : `${lastEnd.broadcaster} soltó el mic`}
        </Text>
        <Text style={styles.stats}>
          {lastEnd.oinkReactions} oinks · {lastEnd.listeners} escuchando
        </Text>
        {lastEnd.wasYou && (
          <Pressable style={styles.primary} onPress={share}>
            <Text style={styles.primaryText}>📣 Compartir SnoutCast</Text>
          </Pressable>
        )}
        <Pressable onPress={dismissEnd}>
          <Text style={styles.ghost}>Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000BB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 180,
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: WA.header,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FF00AA',
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '700', color: WA.text, textAlign: 'center' },
  stats: { fontSize: 14, color: WA.textSecondary },
  primary: {
    marginTop: 12,
    backgroundColor: '#FF00AA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ghost: { fontSize: 14, color: WA.textSecondary, marginTop: 12 },
});
