import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import GameResultModal from '@/components/games/GameResultModal';
import GameShell from '@/components/games/GameShell';
import { getViralGame } from '@/constants/games/catalog';
import { SHOP_PRODUCTS } from '@/constants/games/monetization';
import { MircColors } from '@/constants/theme';
import { saveGameScore, useEconomy } from '@/context/EconomyContext';
import { useGamification } from '@/context/GamificationContext';

const SIZE = 10;
const BLOCKS = ['🟩', '🟫', '⬜', '🟦', '🟧', '🟪'];

export default function LolaCraftScreen() {
  const router = useRouter();
  const game = getViralGame('lola-craft')!;
  const { spendCraftEnergy, craftEnergy, grantCoins, purchaseProduct, hasGamePass } = useEconomy();
  const { recordMessage } = useGamification();

  const [grid, setGrid] = useState(() => Array.from({ length: SIZE * SIZE }, () => 0));
  const [selected, setSelected] = useState(0);
  const [blocksPlaced, setBlocksPlaced] = useState(0);
  const [mode, setMode] = useState<'place' | 'break'>('place');
  const [showResult, setShowResult] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

  const finishSession = useCallback(
    (placed: number) => {
      const score = placed * 10;
      const total = game.coinReward + placed;
      grantCoins(total, game.id);
      recordMessage();
      saveGameScore(game.id, score);
      setSessionScore(score);
      setSessionCoins(total);
      setShowResult(true);
    },
    [game, grantCoins, recordMessage],
  );

  const onCell = (idx: number) => {
    if (mode === 'break') {
      if (grid[idx] === 0) return;
      setGrid((g) => {
        const n = [...g];
        n[idx] = 0;
        return n;
      });
      return;
    }
    if (grid[idx] !== 0) return;
    if (!spendCraftEnergy(1)) {
      Alert.alert(
        'Sin energía ⚡',
        'Compra energía o el Game Pass Builder Pro para bloques ilimitados.',
        [
          { text: 'Cancelar' },
          {
            text: 'Recargar (20 💎)',
            onPress: () => purchaseProduct(SHOP_PRODUCTS.find((p) => p.id === 'energy-refill')!),
          },
        ],
      );
      return;
    }
    setGrid((g) => {
      const n = [...g];
      n[idx] = selected + 1;
      return n;
    });
    setBlocksPlaced((b) => b + 1);
  };

  const energyLabel = useMemo(
    () => (hasGamePass('lola-craft') ? '∞' : String(craftEnergy)),
    [craftEnergy, hasGamePass],
  );

  return (
    <GameShell game={game} scroll={false}>
      <View style={styles.toolbar}>
        <Text style={styles.energy}>⚡ Energía: {energyLabel}</Text>
        <Pressable style={[styles.modeBtn, mode === 'place' && styles.modeActive]} onPress={() => setMode('place')}>
          <Text style={styles.modeText}>PONER</Text>
        </Pressable>
        <Pressable style={[styles.modeBtn, mode === 'break' && styles.modeActive]} onPress={() => setMode('break')}>
          <Text style={styles.modeText}>ROMPER</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => finishSession(blocksPlaced)}>
          <Text style={styles.saveText}>GUARDAR</Text>
        </Pressable>
      </View>

      <View style={styles.palette}>
        {BLOCKS.map((b, i) => (
          <Pressable
            key={b}
            style={[styles.blockPick, selected === i && styles.blockSelected]}
            onPress={() => setSelected(i)}>
            <Text style={styles.blockEmoji}>{b}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((cell, idx) => (
          <Pressable key={idx} style={styles.cell} onPress={() => onCell(idx)}>
            <Text style={styles.cellText}>{cell ? BLOCKS[cell - 1] : '⬛'}</Text>
          </Pressable>
        ))}
      </View>

      {showResult && (
        <GameResultModal
          gameName={game.title}
          score={sessionScore}
          coinsEarned={sessionCoins}
          onPlayAgain={() => {
            setShowResult(false);
            setGrid(Array.from({ length: SIZE * SIZE }, () => 0));
            setBlocksPlaced(0);
          }}
          onExit={() => router.back()}
        />
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  energy: { fontSize: 11, fontFamily: 'Courier', color: MircColors.neonGreen, flex: 1 },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: MircColors.windowBg,
    borderWidth: 1,
    borderColor: MircColors.borderDark,
  },
  modeActive: { borderColor: MircColors.neonCyan, backgroundColor: '#00ffff22' },
  modeText: { fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold' },
  saveBtn: { backgroundColor: MircColors.neonGreen, paddingHorizontal: 10, paddingVertical: 4 },
  saveText: { fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  palette: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  blockPick: { padding: 6, borderWidth: 2, borderColor: 'transparent' },
  blockSelected: { borderColor: MircColors.neonPink },
  blockEmoji: { fontSize: 22 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SIZE * 34,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: MircColors.neonGreen,
  },
  cell: {
    width: 32,
    height: 32,
    margin: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 18 },
});
