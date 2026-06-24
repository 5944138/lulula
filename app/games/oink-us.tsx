import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import GameResultModal from '@/components/games/GameResultModal';
import GameShell from '@/components/games/GameShell';
import { getViralGame } from '@/constants/games/catalog';
import { MircColors } from '@/constants/theme';
import { saveGameScore, useEconomy } from '@/context/EconomyContext';
import { useGamification } from '@/context/GamificationContext';

type Phase = 'brief' | 'task' | 'vote' | 'result';

const CREW = ['Tú', 'PinkPig', 'NeonOink', 'TurboSnout', 'GlitchHog'];

export default function OinkUsScreen() {
  const router = useRouter();
  const game = getViralGame('oink-us')!;
  const { grantCoins } = useEconomy();
  const { recordMessage } = useGamification();

  const [phase, setPhase] = useState<Phase>('brief');
  const [impostor] = useState(() => Math.floor(Math.random() * CREW.length));
  const [taskProgress, setTaskProgress] = useState(0);
  const [suspicion, setSuspicion] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastCoins, setLastCoins] = useState(0);

  const isImpostor = impostor === 0;

  const startRound = () => {
    setPhase('task');
    setTaskProgress(0);
    setSuspicion(null);
  };

  const doTask = () => {
    const next = taskProgress + 1;
    setTaskProgress(next);
    if (next >= 3) setPhase('vote');
  };

  const vote = (idx: number) => {
    setSuspicion(idx);
    const caught = idx === impostor;
    const won = isImpostor ? !caught : caught;
    setPhase('result');

    if (won) {
      const total = game.coinReward + round * 5;
      grantCoins(total, game.id);
      recordMessage();
      saveGameScore(game.id, round * 100);
      setLastScore(round * 100);
      setLastCoins(total);
      setShowResult(true);
    } else {
      setLastScore(0);
      setLastCoins(0);
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (phase === 'brief') {
      const t = setTimeout(startRound, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, round]);

  return (
    <GameShell game={game} scroll>
      <View style={styles.ship}>
        <Text style={styles.role}>{isImpostor ? '😈 IMPOSTOR' : '✅ TRIPULANTE'}</Text>
        <Text style={styles.round}>Ronda {round}</Text>
      </View>

      {phase === 'brief' && <Text style={styles.hint}>Preparando sala…</Text>}

      {phase === 'task' && (
        <>
          <Text style={styles.hint}>
            {isImpostor ? 'Finge tareas. No te descubran.' : 'Completa 3 tareas antes de la votación.'}
          </Text>
          <Text style={styles.progress}>Tareas: {taskProgress}/3</Text>
          <Pressable style={styles.actionBtn} onPress={doTask}>
            <Text style={styles.actionText}>{isImpostor ? 'FINGIR TAREA' : 'HACER TAREA'}</Text>
          </Pressable>
        </>
      )}

      {phase === 'vote' && (
        <>
          <Text style={styles.hint}>🗳️ ¿Quién es sospechoso?</Text>
          {CREW.map((name, i) => (
            <Pressable key={name} style={styles.voteBtn} onPress={() => vote(i)}>
              <Text style={styles.voteText}>{name}</Text>
            </Pressable>
          ))}
        </>
      )}

      <Text style={styles.monetize}>
        🎩 Cosméticos de sombrero · 📦 Caja Oink · Game Pass Detective
      </Text>

      {showResult && (
        <GameResultModal
          gameName={game.title}
          score={lastScore}
          coinsEarned={lastCoins}
          onPlayAgain={() => {
            setShowResult(false);
            setRound((r) => r + 1);
            setPhase('brief');
          }}
          onExit={() => router.back()}
        />
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  ship: {
    padding: 12,
    backgroundColor: '#FF446622',
    borderWidth: 2,
    borderColor: MircColors.part,
    marginBottom: 12,
  },
  role: { fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: MircColors.neonPink },
  round: { fontSize: 11, fontFamily: 'Courier', color: MircColors.textMuted, marginTop: 4 },
  hint: { fontSize: 13, fontFamily: 'Courier', color: MircColors.textLight, marginBottom: 12 },
  progress: { fontSize: 14, fontFamily: 'Courier', color: MircColors.neonCyan, marginBottom: 8 },
  actionBtn: {
    backgroundColor: MircColors.neonGreen,
    padding: 16,
    alignItems: 'center',
  },
  actionText: { fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold', color: '#000' },
  voteBtn: {
    padding: 12,
    marginBottom: 6,
    backgroundColor: MircColors.cardDark,
    borderWidth: 1,
    borderColor: MircColors.borderDark,
  },
  voteText: { fontSize: 13, fontFamily: 'Courier', color: MircColors.textLight },
  monetize: {
    marginTop: 16,
    fontSize: 10,
    fontFamily: 'Courier',
    color: MircColors.textMuted,
    textAlign: 'center',
  },
});
