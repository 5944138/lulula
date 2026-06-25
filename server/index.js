import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

import {
  fechaKeyMX,
  mxSecondsSinceMidnight,
  preguntaDelDia,
} from './preguntas.js';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const TEST_MODE = process.env.SIGNAL_TEST_MODE === 'true' || process.env.SIGNAL_TEST_MODE === '1';
const SIGNAL_HOUR = Number(process.env.SIGNAL_HOUR || 21);

const AVISO_SEC = 20;
const LIVE_SEC = 60;
const TEST_CYCLE_SEC = 180;
const TEST_COUNTDOWN_SEC = 70;
const TEST_RESULTADO_SEC = 30;

const BLOCKED = new Set([
  'puta', 'puto', 'mierda', 'pendejo', 'pendeja', 'chinga', 'verga', 'culero', 'cabron',
  'fuck', 'shit', 'bitch', 'asshole', 'nazi',
]);

/** @type {import('ws').WebSocket[]} */
const clients = new Set();
/** @type {Map<import('ws').WebSocket, { nick: string, submits: number }>} */
const sessions = new Map();

/** @type {'countdown'|'aviso'|'live'|'reveal'|'resultado'} */
let phase = 'countdown';
let phaseEndsAt = Date.now();
let secondsToSignal = 0;
let question = preguntaDelDia();
let signalDateKey = fechaKeyMX();

/** @type {Map<string, { word: string, display: string }>} nick -> word */
let submissions = new Map();

/** @type {null | { question: string, fecha: string, winningWord: string, winningCount: number, topWords: {word:string,count:number}[], totalPlayers: number }} */
let todayResult = null;
/** @type {typeof todayResult} */
let yesterdayResult = null;

let pool = null;

async function initDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  try {
    const { Pool } = await import('pg');
    pool = new Pool({ connectionString: url });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS senales (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        pregunta TEXT NOT NULL,
        palabra_ganadora TEXT NOT NULL,
        total INT NOT NULL,
        top5 JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    const row = await pool.query(
      'SELECT pregunta, palabra_ganadora, total, top5, fecha FROM senales ORDER BY fecha DESC LIMIT 1',
    );
    if (row.rows[0]) {
      const r = row.rows[0];
      yesterdayResult = {
        question: r.pregunta,
        fecha: String(r.fecha).slice(0, 10),
        winningWord: r.palabra_ganadora,
        winningCount: r.top5?.[0]?.count ?? 0,
        topWords: r.top5 ?? [],
        totalPlayers: r.total,
      };
    }
    console.log('  Postgres: tabla senales lista');
  } catch (e) {
    console.warn('  Postgres: omitido —', e.message);
    pool = null;
  }
}

function sanitizeWord(raw) {
  if (typeof raw !== 'string') return null;
  const display = raw.trim().replace(/\s+/g, '');
  if (!display || display.length > 20) return null;
  const normalized = display.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  if (normalized.length < 2) return null;
  if (BLOCKED.has(normalized)) return null;
  for (const bad of BLOCKED) {
    if (normalized.includes(bad)) return null;
  }
  return { normalized, display: display.slice(0, 20) };
}

function livePlayers() {
  return phase === 'live' || phase === 'aviso' ? submissions.size : sessions.size;
}

function secondsLeftInPhase() {
  return Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
}

function secondsUntilSignalMX() {
  const sec = mxSecondsSinceMidnight();
  const target = SIGNAL_HOUR * 3600;
  let diff = target - sec;
  if (diff <= 0) diff += 86400;
  return diff;
}

function buildState() {
  const secToNext =
    phase === 'countdown' || phase === 'resultado'
      ? Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))
      : 0;
  return {
    type: 'state',
    phase,
    secondsToSignal: secToNext,
    secondsLeft: secondsLeftInPhase(),
    livePlayers: livePlayers(),
    question: phase === 'live' || phase === 'aviso' ? question : '',
    signalDate: signalDateKey,
    yesterday: yesterdayResult,
    today: phase === 'resultado' ? todayResult : null,
    testMode: TEST_MODE,
  };
}

function tally() {
  const counts = new Map();
  for (const { normalized } of submissions.values()) {
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  const topWords = [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const winner = topWords[0] ?? { word: 'silencio', count: 0 };
  return { topWords, winner };
}

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

function broadcastState() {
  broadcast(buildState());
}

function buildRevealForNick(nick) {
  const { topWords, winner } = tally();
  const entry = nick ? submissions.get(nick) : null;
  const yourWord = entry?.display ?? null;
  const yourNorm = entry?.normalized ?? null;
  let yourWordCount = 0;
  if (yourNorm) {
    yourWordCount = topWords.find((t) => t.word === yourNorm)?.count ?? 0;
    if (!yourWordCount) {
      const c = new Map();
      for (const { normalized } of submissions.values()) {
        c.set(normalized, (c.get(normalized) ?? 0) + 1);
      }
      yourWordCount = c.get(yourNorm) ?? 0;
    }
  }
  return {
    type: 'reveal',
    question,
    fecha: signalDateKey,
    topWords,
    winningWord: winner.word,
    winningCount: winner.count,
    totalPlayers: submissions.size,
    yourWord,
    yourWordCount,
  };
}

function broadcastReveal() {
  const { topWords, winner } = tally();
  todayResult = {
    question,
    fecha: signalDateKey,
    winningWord: winner.word,
    winningCount: winner.count,
    topWords,
    totalPlayers: submissions.size,
  };

  for (const ws of clients) {
    const sess = sessions.get(ws);
    send(ws, buildRevealForNick(sess?.nick));
  }

  if (pool && todayResult.totalPlayers > 0) {
    pool
      .query(
        `INSERT INTO senales (fecha, pregunta, palabra_ganadora, total, top5)
         VALUES ($1::date,$2,$3,$4,$5::jsonb)
         ON CONFLICT (fecha) DO UPDATE SET
           pregunta=EXCLUDED.pregunta,
           palabra_ganadora=EXCLUDED.palabra_ganadora,
           total=EXCLUDED.total,
           top5=EXCLUDED.top5`,
        [signalDateKey, question, winner.word, submissions.size, JSON.stringify(topWords)],
      )
      .catch(() => {});
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runAvisoLiveReveal() {
  signalDateKey = fechaKeyMX();
  question = preguntaDelDia();
  submissions = new Map();
  for (const [, sess] of sessions) sess.submits = 0;

  phase = 'aviso';
  phaseEndsAt = Date.now() + AVISO_SEC * 1000;
  broadcastState();
  await sleep(AVISO_SEC * 1000);

  phase = 'live';
  phaseEndsAt = Date.now() + LIVE_SEC * 1000;
  broadcastState();
  await sleep(LIVE_SEC * 1000);

  phase = 'reveal';
  phaseEndsAt = Date.now() + 3000;
  broadcastReveal();
  await sleep(3000);

  yesterdayResult = todayResult;
  phase = 'resultado';
  phaseEndsAt = Date.now() + 86400_000;
  broadcastState();
}

async function dailyLoop() {
  if (TEST_MODE) {
    console.log('  ⚠️  SIGNAL_TEST_MODE — ciclo cada 3 min');
    while (true) {
      signalDateKey = fechaKeyMX();
      question = preguntaDelDia();
      submissions = new Map();
      todayResult = null;

      phase = 'countdown';
      secondsToSignal = TEST_COUNTDOWN_SEC;
      phaseEndsAt = Date.now() + TEST_COUNTDOWN_SEC * 1000;
      broadcastState();
      await sleep(TEST_COUNTDOWN_SEC * 1000);

      await runAvisoLiveReveal();

      phase = 'resultado';
      phaseEndsAt = Date.now() + TEST_RESULTADO_SEC * 1000;
      broadcastState();
      await sleep(TEST_RESULTADO_SEC * 1000);
    }
    return;
  }

  while (true) {
    const until = secondsUntilSignalMX();
    phase = 'countdown';
    secondsToSignal = until;
    phaseEndsAt = Date.now() + until * 1000;
    question = preguntaDelDia(new Date(Date.now() + until * 500));
    broadcastState();

    await sleep(until * 1000);
    await runAvisoLiveReveal();

    const nowSec = mxSecondsSinceMidnight();
    const untilTomorrow = 86400 - nowSec + SIGNAL_HOUR * 3600;
    const waitSec = untilTomorrow > 0 ? untilTomorrow : secondsUntilSignalMX();
    phase = 'resultado';
    secondsToSignal = 0;
    phaseEndsAt = Date.now() + waitSec * 1000;
    broadcastState();
    await sleep(waitSec * 1000);
  }
}

function syncCountdownTick() {
  if (phase === 'countdown' || phase === 'resultado') {
    secondsToSignal = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
  }
  broadcastState();
}

const tick = setInterval(syncCountdownTick, 1000);

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, phase, secondsToSignal, testMode: TEST_MODE }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  clients.add(ws);
  send(ws, buildState());
  if (phase === 'resultado' && todayResult) {
    const sess = sessions.get(ws);
    send(ws, {
      ...buildRevealForNick(sess?.nick),
      type: 'reveal',
      question: todayResult.question,
      fecha: todayResult.fecha,
      topWords: todayResult.topWords,
      winningWord: todayResult.winningWord,
      winningCount: todayResult.winningCount,
      totalPlayers: todayResult.totalPlayers,
    });
  }

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return send(ws, { type: 'error', message: 'JSON inválido' });
    }

    if (msg.type === 'join') {
      const nick = String(msg.nick ?? '')
        .trim()
        .slice(0, 24)
        .replace(/[^\w\s\u00C0-\u024F-]/gi, '')
        .trim();
      if (nick.length < 2) return send(ws, { type: 'error', message: 'Nombre muy corto' });
      sessions.set(ws, { nick, submits: 0 });
      send(ws, { type: 'joined', nick });
      broadcastState();
      return;
    }

    if (msg.type === 'submit') {
      const sess = sessions.get(ws);
      if (!sess) return send(ws, { type: 'error', message: 'Primero tu nombre' });
      if (phase !== 'live') return send(ws, { type: 'error', message: 'La Señal no está en vivo' });
      if (sess.submits >= 6) return send(ws, { type: 'error', message: 'Espera un momento' });

      const parsed = sanitizeWord(msg.word);
      if (!parsed) return send(ws, { type: 'error', message: 'Una sola palabra válida' });

      sess.submits += 1;
      submissions.set(sess.nick, parsed);
      send(ws, { type: 'ack', word: parsed.display });
      broadcastState();
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    sessions.delete(ws);
    broadcastState();
  });
});

await initDb();

if (!TEST_MODE) {
  const sec = mxSecondsSinceMidnight();
  const liveStart = SIGNAL_HOUR * 3600 + AVISO_SEC;
  const liveEnd = liveStart + LIVE_SEC;
  if (sec >= SIGNAL_HOUR * 3600 && sec < liveStart) {
    phase = 'aviso';
    phaseEndsAt = Date.now() + (liveStart - sec) * 1000;
  } else if (sec >= liveStart && sec < liveEnd) {
    phase = 'live';
    phaseEndsAt = Date.now() + (liveEnd - sec) * 1000;
    question = preguntaDelDia();
    signalDateKey = fechaKeyMX();
  } else if (sec >= liveEnd && sec < liveEnd + 120) {
    phase = 'resultado';
    todayResult = todayResult ?? yesterdayResult;
  } else {
    phase = 'countdown';
    secondsToSignal = secondsUntilSignalMX();
    phaseEndsAt = Date.now() + secondsToSignal * 1000;
  }
}

httpServer.listen(PORT, HOST, () => {
  console.log(`\n  📡 La Señal · Minatitlán`);
  console.log(`  Hora diaria: ${SIGNAL_HOUR}:00 CDMX`);
  console.log(`  WebSocket: ws://localhost:${PORT}`);
  console.log(`  Test mode: ${TEST_MODE ? 'ON (ciclo 3 min)' : 'off'}\n`);
});

dailyLoop().catch((e) => {
  console.error(e);
  clearInterval(tick);
  process.exit(1);
});
