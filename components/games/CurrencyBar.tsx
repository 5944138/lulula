import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { CURRENCY } from '@/constants/games/monetization';
import { MircColors } from '@/constants/theme';
import { useEconomy } from '@/context/EconomyContext';

export default function CurrencyBar() {
  const router = useRouter();
  const { oinkCoins, pearls, revives } = useEconomy();

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>
          {CURRENCY.oinkCoins.emoji} {oinkCoins.toLocaleString()}
        </Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>
          {CURRENCY.pearls.emoji} {pearls}
        </Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>❤️‍🩹 {revives}</Text>
      </View>
      <Pressable style={styles.shopBtn} onPress={() => router.push('/shop' as Href)}>
        <Text style={styles.shopText}>TIENDA</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: MircColors.cardDark,
    borderWidth: 1,
    borderColor: MircColors.neonCyan + '55',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
  },
  shopBtn: {
    backgroundColor: MircColors.neonPink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  shopText: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#000',
  },
});
