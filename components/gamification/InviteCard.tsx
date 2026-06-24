import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Pressable, Share, StyleSheet, Text } from 'react-native';

import { BRAND } from '@/constants/config';
import { INVITE_MESSAGE } from '@/constants/world';
import { MircColors } from '@/constants/theme';

type Props = {
  cityName: string;
  tribeName: string;
  nick: string;
  onShared?: () => void;
};

export default function InviteCard({ cityName, tribeName, nick, onShared }: Props) {
  const message = INVITE_MESSAGE(cityName, tribeName, nick);

  const share = async () => {
    try {
      await Share.share({ message, title: BRAND.name });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onShared?.();
    } catch {
      await Clipboard.setStringAsync(message);
      onShared?.();
    }
  };

  return (
    <Pressable style={styles.card} onPress={share}>
      <Text style={styles.title}>📣 Invita con Lulula</Text>
      <Text style={styles.body}>
        Comparte Lulula con 3 amigos y desbloquea el badge Reclutador. Oink viral garantizado.
      </Text>
      <Text style={styles.cta}>[ TAP TO COPY & SHARE ]</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MircColors.cardDark,
    borderWidth: 2,
    borderColor: MircColors.neonPink,
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  body: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: MircColors.textLight,
    lineHeight: 18,
  },
  cta: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: MircColors.neonCyan,
    textAlign: 'center',
    marginTop: 4,
  },
});
