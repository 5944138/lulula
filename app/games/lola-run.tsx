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

type Obstacle = { id: number; lane: number; y: number };

export default function LolaRunScreen() {
  const router = useRouter();
  const game = getViralGame('lola-run')!;
  const { grantCoins, spendRevive, hasGamePass } = useEconomy();
  const { recordMessage } = useGamification();

  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [running, setRunning] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const idRef = useRef(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const magnet = hasGamePass('lola-run');

  const crash = useCallback(() => {
    setRunning(false);
    const total = game.coinReward + coins;
    grantCoins(total, game.id);
    recordMessage();
    saveGameScore(game.id, score);
    setFinalScore(score);
    setEarnedCoins(total);
    setShowResult(true);
  }, [coins, game, grantCoins, recordMessage, score]);

  useEffect(() => {
    if (!running) return;
    const loop = setInterval(() => {
      setScore((s) => s + 1);
      setObstacles((obs) => {
        const moved = obs
          .map((o) => ({ ...o, y: o.y + 12 }))
          .filter((o) => o.y < 320);
        if (Math.random() < 0.35) {
          moved.push({ id: idRef.current++, lane: Math.floor(Math.random() * 3), y: 0 });
        }
        return moved;
      });
    }, 120);
    return () => clearInterval(loop);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    for (const o of obstacles) {
      if (o.y > 220 && o.y < 260 && o.lane === lane) {
        crash();
        break;
      }
      if (magnet && o.y > 200 && o.y < 240 && Math.abs(o.lane - lane) <= 1) {
        setCoins((c) => c + 2);
      }
    }
  }, [obstacles, lane, running, crash, magnet]);

  return (
    <GameShell game={game} scroll={false}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>⚡ {score}</Text>
        <Text style={styles.hudText}>🪙 {coins}</Text>
      </View>

      {!running ? (
        <Pressable style={styles.start} onPress={() => setRunning(true)}>
          <LolaCharacter size={80} mood="wink" bounce />
          <Text style={styles.startText}>CORRER</Text>
        </Pressable>
      ) : (
        <View style={styles.track}>
          {[0, 1, 2].map((l) => (
            <View key={l} style={[styles.lane, lane === l && styles.laneHere]}>
              {obstacles
                .filter((o) => o.lane === l)
                .map((o) => (
                  <Text key={o.id} style={[styles.train, { top: o.y }]}>
                    🚧
                  </Text>
                ))}
              {lane === l && (
                <View style={styles.runner}>
                  <LolaCharacter size={48} mood="excited" bounce />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {running && (
        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={() => setLane((x) => Math.max(0, x - 1))}>
            <Text style={styles.btnText}>←</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => setLane((x) => Math.min(2, x + 1))}>
            <Text style={styles.btnText}>→</Text>
          </Pressable>
        </View>
      )}

      {showResult && (
        <GameResultModal
          gameName={game.title}
          score={finalScore}
          coinsEarned={earnedCoins}
          onPlayAgain={() => {
            setShowResult(false);
            if (spendRevive()) {
              setRunning(true);
              setObstacles([]);
              return;
            }
            setScore(0);
            setCoins(0);
            setObstacles([]);
            setRunning(true);
          }}
          onExit={() => router.back()}
        />
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  hud: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  hudText: { fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonCyan },
  start: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  startText: {
    fontSize: 22,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: MircColors.neonPink,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 300,
    borderWidth: 2,
    borderColor: MircColors.neonCyan,
  },
  lane: { flex: 1, borderRightWidth: 1, borderColor: '#fff2' },
  laneHere: { backgroundColor: '#00ffff0a' },
  train: { position: 'absolute', fontSize: 28, alignSelf: 'center' },
  runner: { position: 'absolute', bottom: 20, alignSelf: 'center' },
  controls: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    backgroundColor: MircColors.neonPink,
    padding: 20,
    alignItems: 'center',
  },
  btnText: { fontSize: 24, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
});
