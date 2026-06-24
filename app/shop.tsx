import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LululaLogo from '@/components/brand/LululaLogo';
import CurrencyBar from '@/components/games/CurrencyBar';
import MircWindow from '@/components/mirc/MircWindow';
import {
  COSMETICS,
  GAME_PASSES,
  SHOP_PRODUCTS,
} from '@/constants/games/monetization';
import { MircColors } from '@/constants/theme';
import { useEconomy } from '@/context/EconomyContext';

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    purchaseProduct,
    buyCosmetic,
    buyGamePass,
    watchAdReward,
    claimDailyPearls,
    ownedCosmetics,
  } = useEconomy();
  const [tab, setTab] = useState<'pearls' | 'cosmetics' | 'passes'>('pearls');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
        <MircWindow title="Tienda Lulula" style={styles.window}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Volver</Text>
        </Pressable>

        <LululaLogo size="sm" />
        <CurrencyBar />

        <View style={styles.freeRow}>
          <Pressable
            style={styles.freeBtn}
            onPress={() => {
              if (claimDailyPearls()) Alert.alert('¡Perlas gratis!', '+5 💎 diarias');
              else Alert.alert('Ya reclamaste hoy');
            }}>
            <Text style={styles.freeText}>🎁 Perlas diarias</Text>
          </Pressable>
          <Pressable
            style={styles.freeBtn}
            onPress={() => {
              if (watchAdReward()) Alert.alert('Anuncio visto', '+50 🪙 (mock — conectar AdMob)');
              else Alert.alert('Límite de anuncios hoy');
            }}>
            <Text style={styles.freeText}>📺 Ver anuncio</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(['pearls', 'cosmetics', 'passes'] as const).map((t) => (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)}>
              <Text style={styles.tabText}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {tab === 'pearls' &&
            SHOP_PRODUCTS.map((p) => (
              <Pressable
                key={p.id}
                style={styles.item}
                onPress={async () => {
                  const ok = await purchaseProduct(p);
                  Alert.alert(ok ? 'Comprado' : 'No se pudo comprar', p.name);
                }}>
                <Text style={styles.itemEmoji}>{p.emoji}</Text>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{p.name}</Text>
                  <Text style={styles.itemSub}>{p.description}</Text>
                  <Text style={styles.price}>
                    {p.priceUsd ? `$${p.priceUsd} USD` : ''}
                    {p.pricePearls ? ` ${p.pricePearls} 💎` : ''}
                    {p.priceCoins ? ` ${p.priceCoins} 🪙` : ''}
                  </Text>
                  <Text style={styles.sku}>SKU: {p.sku}</Text>
                </View>
              </Pressable>
            ))}

          {tab === 'cosmetics' &&
            COSMETICS.map((c) => {
              const owned = ownedCosmetics.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  style={styles.item}
                  onPress={async () => {
                    if (owned) return;
                    const ok = await buyCosmetic(c.id);
                    Alert.alert(ok ? 'Desbloqueado' : 'Monedas insuficientes', c.name);
                  }}>
                  <Text style={styles.itemEmoji}>{c.emoji}</Text>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle}>{c.name}</Text>
                    <Text style={styles.itemSub}>{c.slot} · {c.rarity}</Text>
                    <Text style={styles.price}>
                      {owned ? '✅ Tuyo' : c.pricePearls ? `${c.pricePearls} 💎` : `${c.priceCoins} 🪙`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

          {tab === 'passes' &&
            GAME_PASSES.map((p) => (
              <Pressable
                key={p.id}
                style={styles.item}
                onPress={async () => {
                  const ok = await buyGamePass(p.gameId);
                  Alert.alert(ok ? 'Game Pass activo' : 'Perlas insuficientes', p.name);
                }}>
                <Text style={styles.itemEmoji}>🎫</Text>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{p.name}</Text>
                  <Text style={styles.itemSub}>{p.benefits.join(' · ')}</Text>
                  <Text style={styles.price}>{p.pricePearls} 💎 · ${p.priceUsd}</Text>
                </View>
              </Pressable>
            ))}
        </ScrollView>
      </MircWindow>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MircColors.desktop, padding: 8 },
  window: { flex: 1 },
  back: { fontSize: 12, fontFamily: 'Courier', color: MircColors.neonCyan, marginBottom: 8 },
  freeRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  freeBtn: {
    flex: 1,
    backgroundColor: MircColors.neonGreen,
    padding: 10,
    alignItems: 'center',
  },
  freeText: { fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tab: { flex: 1, padding: 8, backgroundColor: MircColors.cardDark, alignItems: 'center' },
  tabOn: { backgroundColor: MircColors.neonPink },
  tabText: { fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  list: { gap: 8, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: MircColors.cardDark,
    borderWidth: 1,
    borderColor: MircColors.borderDark,
  },
  itemEmoji: { fontSize: 28 },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 13, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonCyan },
  itemSub: { fontSize: 10, fontFamily: 'Courier', color: MircColors.textMuted },
  price: { fontSize: 11, fontFamily: 'Courier', color: MircColors.neonPink, fontWeight: 'bold' },
  sku: { fontSize: 8, fontFamily: 'Courier', color: MircColors.textDim },
});
