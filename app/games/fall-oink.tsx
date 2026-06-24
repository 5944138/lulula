import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import LolaCharacter from '@/components/brand/LolaCharacter';
import GameResultModal from '@/components/games/GameResultModal';
import GameShell from '@/components/games/GameShell';
import { getViralGame } from '@/constants/games/catalog';
import { MircColors } from '@/constants/theme';
import { saveGameScore, useEconomy } from '@/context/EconomyContext';
import { useGamification } from '@/context/GamificationContext';

const LANES = 3;

export default function FallOinkScreen() {
  const router = useRouter();
  const game = getViralGame('fall-oink')!;
  const { grantCoins, spendRevive } = useEconomy();
  const { recordMessage } = useGamification();

  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const [obstacleLane, setObstacleLane] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const tick = useRef(0);

  const endGame = useCallback(
    (scoreValue: number) => {
      const total = game.coinReward + Math.floor(scoreValue / 5);
      grantCoins(total, game.id);
      recordMessage();
      saveGameScore(game.id, scoreValue);
      setFinalScore(scoreValue);
      setEarnedCoins(total);
      setShowResult(true);
    },
    [game, grantCoins, recordMessage],
  );

  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      tick.current += 1;
      setObstacleLane(Math.floor(Math.random() * LANES));
      setScore((s) => s + 1);
    }, 800);
    return () => clearInterval(id);
  }, [alive]);

  useEffect(() => {
    if (!alive) return;
    if (lane === obstacleLane && tick.current > 2) {
      setAlive(false);
      endGame(score);
    }
  }, [lane, obstacleLane, alive, score, endGame]);

  const move = (dir: -1 | 1) => {
    setLane((l) => Math.max(0, Math.min(LANES - 1, l + dir)));
  };

  return (
    <GameShell game={game} scroll={false}>
      <Text style={styles.score}>🏆 {score} pts</Text>

      <View style={styles.arena}>
        {Array.from({ length: LANES }).map((_, i) => (
          <View key={i} style={[styles.lane, lane === i && styles.laneActive]}>
            {obstacleLane === i && alive && (
              <Text style={styles.obstacle}>🟣</Text>
            )}
            {lane === i && (
              <View style={styles.player}>
                <LolaCharacter size={40} mood="happy" bounce />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.ctrl} onPress={() => move(-1)}>
          <Text style={styles.ctrlText}>← IZQ</Text>
        </Pressable>
        <Pressable style={styles.ctrl} onPress={() => move(1)}>
          <Text style={styles.ctrlText}>DER →</Text>
        </Pressable>
      </View>

      <Text style={styles.tip}>Esquiva los bloques. Revive con 💎 o Game Pass Crown Club.</Text>

      {showResult && (
        <GameResultModal
          gameName={game.title}
          score={finalScore}
          coinsEarned={earnedCoins}
          onPlayAgain={() => {
            setShowResult(false);
            if (spendRevive()) {
              setAlive(true);
              return;
            }
            setAlive(true);
            setScore(0);
            tick.current = 0;
          }}
          onExit={() => router.back()}
        />
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  score: {
    fontSize: 20,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonCyan,
    textAlign: 'center',
    marginBottom: 8,
  },
  arena: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 280,
    borderWidth: 2,
    borderColor: MircColors.neonPink,
  },
  lane: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  laneActive: { backgroundColor: '#ff00aa11' },
  obstacle: { fontSize: 36, position: 'absolute', top: 40 },
  player: { marginBottom: 8 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 12 },
  ctrl: {
    flex: 1,
    backgroundColor: MircColors.neonGreen,
    padding: 16,
    alignItems: 'center',
  },
  ctrlText: { fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  tip: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
