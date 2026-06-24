import 'dotenv/config';
import { createServer } from 'node:http';
import { Client } from 'irc-framework';
import { WebSocketServer } from 'ws';

import { authStatus, revokeSession, sendOtp, validateSession, verifyOtp } from './auth.js';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const IRC_HOST = process.env.IRC_HOST || 'irc.libera.chat';
const IRC_PORT = Number(process.env.IRC_PORT || 6697);
const IRC_TLS = process.env.IRC_TLS !== 'false';

/** @type {Map<import('ws').WebSocket, Session>} */
const sessions = new Map();

/**
 * @typedef {Object} Session
 * @property {import('irc-framework').Client} irc
 * @property {string} nick
 * @property {Set<string>} channels
 * @property {Map<string, string[]>} nicklists
 * @property {boolean} connected
 */

function send(ws, type, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function formatTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 4096) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeChannel(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('#') || trimmed.startsWith('&') ? trimmed : `#${trimmed}`;
}

function wireIrcToWs(ws, client, session) {
  client.on('registered', () => {
    session.connected = true;
    send(ws, 'registered', {
      nick: session.nick,
      server: IRC_HOST,
      message: `Conectado a ${IRC_HOST} como ${session.nick}`,
    });
  });

  client.on('message', (event) => {
    const target = event.target;
    const isChannel = target.startsWith('#') || target.startsWith('&');

    send(ws, 'message', {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: formatTime(),
      target,
      channel: isChannel ? target : null,
      nick: event.nick,
      text: event.message,
      msgType: event.type === 'action' ? 'action' : 'chat',
      fromMe: event.nick === session.nick,
    });
  });

  client.on('action', (event) => {
    send(ws, 'message', {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: formatTime(),
      target: event.target,
      channel: event.target.startsWith('#') ? event.target : null,
      nick: event.nick,
      text: event.message,
      msgType: 'action',
      fromMe: event.nick === session.nick,
    });
  });

  client.on('join', (event) => {
    const channel = event.channel;
    session.channels.add(channel);

    if (!session.nicklists.has(channel)) {
      session.nicklists.set(channel, []);
    }

    send(ws, 'join', {
      time: formatTime(),
      channel,
      nick: event.nick,
      fromMe: event.nick === session.nick,
      text: `${event.nick} entró a ${channel}`,
    });

    if (event.nick === session.nick) {
      client.raw('NAMES', channel);
    }
  });

  client.on('part', (event) => {
    if (event.nick === session.nick) {
      session.channels.delete(event.channel);
      session.nicklists.delete(event.channel);
    }

    send(ws, 'part', {
      time: formatTime(),
      channel: event.channel,
      nick: event.nick,
      fromMe: event.nick === session.nick,
      text: `${event.nick} salió de ${event.channel}`,
    });
  });

  client.on('quit', (event) => {
    send(ws, 'quit', {
      time: formatTime(),
      nick: event.nick,
      text: `${event.nick} se desconectó${event.message ? ` (${event.message})` : ''}`,
    });
  });

  client.on('nick', (event) => {
    if (event.nick === session.nick) {
      session.nick = event.new_nick;
    }
    send(ws, 'nick', {
      time: formatTime(),
      oldNick: event.nick,
      newNick: event.new_nick,
      text: `${event.nick} ahora es ${event.new_nick}`,
    });
  });

  client.on('topic', (event) => {
    send(ws, 'topic', {
      channel: event.channel,
      topic: event.topic,
      nick: event.nick,
    });
  });

  client.on('userlist', (event) => {
    const nicks = event.users.map((u) => ({
      nick: u.username || u.nick,
      mode: u.modes?.includes('o') ? 'op' : u.modes?.includes('v') ? 'voice' : 'normal',
    }));
    session.nicklists.set(event.channel, nicks.map((n) => n.nick));
    send(ws, 'nicklist', { channel: event.channel, users: nicks });
  });

  client.on('close', () => {
    session.connected = false;
    send(ws, 'disconnected', { message: 'Desconectado del servidor IRC' });
  });

  client.on('debug', (msg) => {
    if (process.env.DEBUG) console.log('[irc]', msg);
  });
}

async function connectIrc(ws, nick) {
  const client = new Client();
  const session = {
    irc: client,
    nick,
    channels: new Set(),
    nicklists: new Map(),
    connected: false,
  };

  sessions.set(ws, session);
  wireIrcToWs(ws, client, session);

  send(ws, 'connecting', { nick, server: IRC_HOST, message: 'Marcando el 28.8k...' });

  try {
    await client.connect({
      host: IRC_HOST,
      port: IRC_PORT,
      tls: IRC_TLS,
      nick,
      username: 'lulula',
      realname: 'Lulula App User — lulula.app',
      auto_reconnect: true,
    });
  } catch (err) {
    send(ws, 'error', { message: err.message || 'No se pudo conectar al IRC' });
    sessions.delete(ws);
    client.quit('Connection failed');
  }
}

function handleMessage(ws, data) {
  let msg;
  try {
    msg = JSON.parse(data.toString());
  } catch {
    send(ws, 'error', { message: 'JSON inválido' });
    return;
  }

  const session = sessions.get(ws);

  switch (msg.type) {
    case 'connect': {
      if (session?.connected) {
        send(ws, 'error', { message: 'Ya estás conectado' });
        return;
      }
      const nick = (msg.nick || '').trim().replace(/\s/g, '_').slice(0, 16);
      if (!nick || nick.length < 2) {
        send(ws, 'error', { message: 'Nick inválido (mínimo 2 caracteres)' });
        return;
      }
      if (session) {
        session.irc.quit();
        sessions.delete(ws);
      }
      connectIrc(ws, nick);
      break;
    }

    case 'join': {
      if (!session?.connected) {
        send(ws, 'error', { message: 'No conectado' });
        return;
      }
      const channel = normalizeChannel(msg.channel);
      if (!channel) {
        send(ws, 'error', { message: 'Canal inválido' });
        return;
      }
      session.irc.join(channel);
      break;
    }

    case 'part': {
      if (!session?.connected) return;
      const channel = normalizeChannel(msg.channel);
      if (channel) session.irc.part(channel);
      break;
    }

    case 'say': {
      if (!session?.connected) {
        send(ws, 'error', { message: 'No conectado' });
        return;
      }
      const text = (msg.text || '').trim();
      if (!text) return;

      const target = msg.target || msg.channel;
      if (!target) {
        send(ws, 'error', { message: 'Destino requerido' });
        return;
      }

      if (text.startsWith('/me ')) {
        session.irc.action(target, text.slice(4));
      } else {
        session.irc.say(target, text);
      }
      break;
    }

    case 'pm': {
      if (!session?.connected) {
        send(ws, 'error', { message: 'No conectado' });
        return;
      }
      const text = (msg.text || '').trim();
      const target = (msg.nick || '').trim();
      if (!text || !target) return;
      session.irc.say(target, text);
      break;
    }

    case 'join_batch': {
      if (!session?.connected) {
        send(ws, 'error', { message: 'No conectado' });
        return;
      }
      const list = Array.isArray(msg.channels) ? msg.channels : [];
      list.forEach((ch, i) => {
        const channel = normalizeChannel(String(ch));
        if (channel) {
          setTimeout(() => session.irc.join(channel), i * 350);
        }
      });
      break;
    }

    case 'away': {
      if (!session?.connected) return;
      const status = (msg.status || '').trim();
      if (status) {
        session.irc.raw('AWAY', `:${status}`);
      } else {
        session.irc.raw('AWAY');
      }
      send(ws, 'status', { away: Boolean(status), status });
      break;
    }

    case 'disconnect': {
      if (session) {
        session.irc.quit('Lulula logout');
        sessions.delete(ws);
      }
      send(ws, 'disconnected', { message: 'Sesión cerrada' });
      break;
    }

    default:
      send(ws, 'error', { message: `Comando desconocido: ${msg.type}` });
  }
}

const httpServer = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url?.split('?')[0] ?? '';

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        service: 'lulula-bridge',
        sessions: sessions.size,
        irc: IRC_HOST,
        version: '1.2.0',
        auth: authStatus(),
      }),
    );
    return;
  }

  if (url === '/auth/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(authStatus()));
    return;
  }

  if (url === '/auth/send-otp' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const result = await sendOtp(body.phone);
      res.writeHead(result.ok ? 200 : result.status || 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'JSON inválido' }));
    }
    return;
  }

  if (url === '/auth/verify-otp' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const result = verifyOtp(body.phone, body.code);
      res.writeHead(result.ok ? 200 : result.status || 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'JSON inválido' }));
    }
    return;
  }

  if (url === '/auth/logout' && req.method === 'POST') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    revokeSession(token);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url === '/auth/session' && req.method === 'GET') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const session = validateSession(token);
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Sesión inválida' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, phone: session.phone }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lulula IRC Bridge OK\n');
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  send(ws, 'hello', {
    message: 'Lulula bridge ready',
    server: IRC_HOST,
    version: '1.0.0',
  });

  ws.on('message', (data) => handleMessage(ws, data));

  ws.on('close', () => {
    const session = sessions.get(ws);
    if (session) {
      session.irc.quit('Client disconnected');
      sessions.delete(ws);
    }
  });
});

httpServer.listen(PORT, HOST, () => {
  const auth = authStatus();
  console.log(`\n  ✨ Lulula IRC Bridge v2.0`);
  console.log(`  WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`  Health:    http://0.0.0.0:${PORT}/health`);
  console.log(`  Auth SMS:  ${auth.smsMode === 'dev' ? 'DEV (consola)' : 'Twilio ✓'}`);
  console.log(`  IRC: ${IRC_TLS ? 'tls://' : ''}${IRC_HOST}:${IRC_PORT}\n`);
});
