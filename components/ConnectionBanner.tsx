import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HTTP_BRIDGE, WS_URL } from '@/constants/config';
import { MircColors } from '@/constants/theme';
import { useIRC } from '@/context/IRCContext';

export default function ConnectionBanner() {
  const { connectionState, bridgeReady, statusMessage, reconnect } = useIRC();

  if (connectionState === 'connected' && bridgeReady) return null;

  const isError = connectionState === 'error' || connectionState === 'disconnected';

  return (
    <View style={[styles.banner, isError && styles.bannerError]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>
          {connectionState === 'connecting' ? '📡 Conectando...' : '⚠️ Sin conexión'}
        </Text>
        <Text style={styles.msg} numberOfLines={2}>
          {statusMessage}
        </Text>
        <Text style={styles.hint}>
          Bridge: {WS_URL} · {HTTP_BRIDGE}/health
        </Text>
      </View>
      {isError && (
        <Pressable style={styles.btn} onPress={reconnect}>
          <Text style={styles.btnText}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a2840',
    borderBottomWidth: 2,
    borderBottomColor: MircColors.neonCyan,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerError: {
    borderBottomColor: MircColors.part,
    backgroundColor: '#2a1018',
  },
  textBlock: { flex: 1, gap: 2 },
  title: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  msg: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.textLight,
  },
  hint: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
  },
  btn: {
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderTopColor: '#ff66cc',
    borderLeftColor: '#ff66cc',
    borderBottomColor: '#990066',
    borderRightColor: '#990066',
  },
  btnText: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
  },
});
