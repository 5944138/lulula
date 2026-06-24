import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { WS_URL } from '@/constants/config';
import { LEGACY_KEYS, STORAGE_KEYS, pickMigrated } from '@/constants/storage';
import type {
  ChannelRoom,
  ConnectionState,
  IRCMessage,
  PMRoom,
  WsServerEvent,
} from '@/lib/irc/types';

type IRCContextValue = {
  connectionState: ConnectionState;
  bridgeReady: boolean;
  nick: string;
  vibe: string;
  serverName: string;
  statusMessage: string;
  channels: ChannelRoom[];
  pms: PMRoom[];
  activeChannel: string | null;
  connect: (nick: string) => void;
  reconnect: () => void;
  disconnect: () => void;
  joinChannel: (channel: string) => void;
  joinChannels: (channels: string[]) => void;
  partChannel: (channel: string) => void;
  sendChannel: (channel: string, text: string) => void;
  sendPM: (targetNick: string, text: string) => void;
  markChannelRead: (channel: string) => void;
  markPMRead: (nick: string) => void;
  setVibe: (vibe: string) => void;
  getChannel: (name: string) => ChannelRoom | undefined;
  getPM: (nick: string) => PMRoom | undefined;
};

const IRCContext = createContext<IRCContextValue | null>(null);

function emptyChannel(name: string): ChannelRoom {
  return { name, topic: '', messages: [], users: [], unread: 0 };
}

function emptyPM(nick: string): PMRoom {
  return { nick, messages: [], unread: 0 };
}

function appendMessage(list: IRCMessage[], msg: IRCMessage, max = 300): IRCMessage[] {
  const next = [...list, msg];
  return next.length > max ? next.slice(-max) : next;
}

export function IRCProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const nickRef = useRef('');
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualDisconnect = useRef(false);
  const connectRef = useRef<(nick: string) => void>(() => {});

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [bridgeReady, setBridgeReady] = useState(false);
  const [nick, setNick] = useState('');
  const [vibe, setVibeState] = useState('🟢 Online — vibing');
  const [serverName, setServerName] = useState('Libera Chat');
  const [statusMessage, setStatusMessage] = useState('');
  const [channels, setChannels] = useState<ChannelRoom[]>([]);
  const [pms, setPms] = useState<PMRoom[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const sendWs = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const ensureChannel = useCallback((name: string, updater?: (room: ChannelRoom) => ChannelRoom) => {
    setChannels((prev) => {
      const idx = prev.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
      if (idx === -1) {
        const room = updater ? updater(emptyChannel(name)) : emptyChannel(name);
        return [...prev, room];
      }
      if (!updater) return prev;
      const copy = [...prev];
      copy[idx] = updater(copy[idx]);
      return copy;
    });
  }, []);

  const ensurePM = useCallback((pmNick: string, updater?: (room: PMRoom) => PMRoom) => {
    setPms((prev) => {
      const idx = prev.findIndex((p) => p.nick.toLowerCase() === pmNick.toLowerCase());
      if (idx === -1) {
        const room = updater ? updater(emptyPM(pmNick)) : emptyPM(pmNick);
        return [...prev, room];
      }
      if (!updater) return prev;
      const copy = [...prev];
      copy[idx] = updater(copy[idx]);
      return copy;
    });
  }, []);

  const handleServerEvent = useCallback(
    (event: WsServerEvent) => {
      switch (event.type) {
        case 'hello':
          setServerName(event.server);
          setBridgeReady(true);
          break;

        case 'connecting':
          setConnectionState('connecting');
          setStatusMessage(event.message);
          break;

        case 'registered':
          setConnectionState('connected');
          setNick(event.nick);
          nickRef.current = event.nick;
          setStatusMessage(event.message);
          AsyncStorage.setItem(STORAGE_KEYS.nick, event.nick);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;

        case 'disconnected':
          setConnectionState('disconnected');
          setStatusMessage(event.message);
          break;

        case 'error':
          setConnectionState('error');
          setStatusMessage(event.message);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'message': {
          const isPM = !event.channel;
          const msg: IRCMessage = {
            id: event.id,
            time: event.time,
            type: event.msgType,
            nick: event.nick,
            text: event.text,
            fromMe: event.fromMe,
            target: event.target,
            channel: event.channel,
          };

          if (isPM) {
            const other = event.fromMe ? event.target : event.nick;
            ensurePM(other, (room) => ({
              ...room,
              messages: appendMessage(room.messages, msg),
              unread: room.unread + (event.fromMe ? 0 : 1),
            }));
          } else if (event.channel) {
            const isActive = activeChannel?.toLowerCase() === event.channel.toLowerCase();
            ensureChannel(event.channel, (room) => ({
              ...room,
              messages: appendMessage(room.messages, msg),
              unread: room.unread + (isActive || event.fromMe ? 0 : 1),
            }));
            if (!event.fromMe) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
          break;
        }

        case 'join': {
          const joinMsg: IRCMessage = {
            id: `join-${Date.now()}`,
            time: event.time,
            type: 'join',
            nick: event.nick,
            text: event.text,
            fromMe: event.fromMe,
            channel: event.channel,
          };
          ensureChannel(event.channel, (room) => ({
            ...room,
            messages: appendMessage(room.messages, joinMsg),
          }));
          break;
        }

        case 'part': {
          const partMsg: IRCMessage = {
            id: `part-${Date.now()}`,
            time: event.time,
            type: 'part',
            nick: event.nick,
            text: event.text,
            fromMe: event.fromMe,
            channel: event.channel,
          };
          ensureChannel(event.channel, (room) => ({
            ...room,
            messages: appendMessage(room.messages, partMsg),
          }));
          break;
        }

        case 'quit': {
          const quitMsg: IRCMessage = {
            id: `quit-${Date.now()}`,
            time: event.time,
            type: 'quit',
            nick: event.nick,
            text: event.text,
          };
          setChannels((prev) =>
            prev.map((room) => ({
              ...room,
              messages: appendMessage(room.messages, quitMsg),
            })),
          );
          break;
        }

        case 'topic':
          ensureChannel(event.channel, (room) => ({ ...room, topic: event.topic }));
          break;

        case 'nicklist':
          ensureChannel(event.channel, (room) => ({ ...room, users: event.users }));
          break;

        default:
          break;
      }
    },
    [activeChannel, ensureChannel, ensurePM],
  );

  const openSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return wsRef.current;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return wsRef.current;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setBridgeReady(true);
      setStatusMessage('Bridge conectado');
    };

    ws.onmessage = (e) => {
      try {
        handleServerEvent(JSON.parse(String(e.data)) as WsServerEvent);
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {
      setBridgeReady(false);
      setConnectionState('error');
      setStatusMessage(`Bridge caído — ¿corre npm run server? (${WS_URL})`);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setBridgeReady(false);
      if (manualDisconnect.current) return;
      const savedNick = nickRef.current;
      if (!savedNick) return;
      setConnectionState('disconnected');
      setStatusMessage('Conexión perdida — reintentando...');
      reconnectTimer.current = setTimeout(() => connectRef.current(savedNick), 2500);
    };

    return ws;
  }, [handleServerEvent]);

  const connect = useCallback(
    (nextNick: string) => {
      manualDisconnect.current = false;
      nickRef.current = nextNick;
      const ws = openSocket();
      const tryConnect = () => sendWs({ type: 'connect', nick: nextNick });

      if (ws.readyState === WebSocket.OPEN) {
        tryConnect();
      } else {
        const prevOnOpen = ws.onopen;
        ws.onopen = (ev) => {
          prevOnOpen?.call(ws, ev);
          tryConnect();
        };
      }

      setConnectionState('connecting');
      setStatusMessage('Marcando el 28.8k...');
    },
    [openSocket, sendWs],
  );

  connectRef.current = connect;

  const reconnect = useCallback(() => {
    if (nickRef.current) connect(nickRef.current);
  }, [connect]);

  const disconnect = useCallback(() => {
    manualDisconnect.current = true;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    sendWs({ type: 'disconnect' });
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState('disconnected');
    setChannels([]);
    setPms([]);
    setNick('');
    nickRef.current = '';
  }, [sendWs]);

  const joinChannel = useCallback(
    (channel: string) => {
      sendWs({ type: 'join', channel });
      ensureChannel(channel);
      setActiveChannel(channel);
    },
    [ensureChannel, sendWs],
  );

  const joinChannels = useCallback(
    (list: string[]) => {
      list.forEach((ch) => ensureChannel(ch));
      sendWs({ type: 'join_batch', channels: list });
    },
    [ensureChannel, sendWs],
  );

  const partChannel = useCallback(
    (channel: string) => {
      sendWs({ type: 'part', channel });
      setChannels((prev) => prev.filter((c) => c.name.toLowerCase() !== channel.toLowerCase()));
    },
    [sendWs],
  );

  const sendChannel = useCallback(
    (channel: string, text: string) => {
      sendWs({ type: 'say', target: channel, text });
    },
    [sendWs],
  );

  const sendPM = useCallback(
    (targetNick: string, text: string) => {
      sendWs({ type: 'pm', nick: targetNick, text });
    },
    [sendWs],
  );

  const markChannelRead = useCallback((channel: string) => {
    setActiveChannel(channel);
    setChannels((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === channel.toLowerCase() ? { ...c, unread: 0 } : c,
      ),
    );
  }, []);

  const markPMRead = useCallback((pmNick: string) => {
    setPms((prev) =>
      prev.map((p) => (p.nick.toLowerCase() === pmNick.toLowerCase() ? { ...p, unread: 0 } : p)),
    );
  }, []);

  const setVibe = useCallback((next: string) => {
    setVibeState(next);
    AsyncStorage.setItem(STORAGE_KEYS.vibe, next);
    sendWs({ type: 'away', status: next });
  }, [sendWs]);

  const getChannel = useCallback(
    (name: string) => channels.find((c) => c.name.toLowerCase() === name.toLowerCase()),
    [channels],
  );

  const getPM = useCallback(
    (pmNick: string) => pms.find((p) => p.nick.toLowerCase() === pmNick.toLowerCase()),
    [pms],
  );

  useEffect(() => {
    AsyncStorage.multiGet([
      STORAGE_KEYS.nick,
      STORAGE_KEYS.vibe,
      STORAGE_KEYS.joined,
      LEGACY_KEYS.nick,
      LEGACY_KEYS.vibe,
      LEGACY_KEYS.joined,
    ]).then((pairs) => {
      const storedNick = pickMigrated(pairs, STORAGE_KEYS.nick, LEGACY_KEYS.nick);
      const storedVibe = pickMigrated(pairs, STORAGE_KEYS.vibe, LEGACY_KEYS.vibe);
      if (storedVibe) setVibeState(storedVibe);
      if (storedNick) setNick(storedNick);
    });
  }, []);

  const value = useMemo(
    () => ({
      connectionState,
      bridgeReady,
      nick,
      vibe,
      serverName,
      statusMessage,
      channels,
      pms,
      activeChannel,
      connect,
      reconnect,
      disconnect,
      joinChannel,
      joinChannels,
      partChannel,
      sendChannel,
      sendPM,
      markChannelRead,
      markPMRead,
      setVibe,
      getChannel,
      getPM,
    }),
    [
      connectionState,
      bridgeReady,
      nick,
      vibe,
      serverName,
      statusMessage,
      channels,
      pms,
      activeChannel,
      connect,
      reconnect,
      disconnect,
      joinChannel,
      joinChannels,
      partChannel,
      sendChannel,
      sendPM,
      markChannelRead,
      markPMRead,
      setVibe,
      getChannel,
      getPM,
    ],
  );

  return <IRCContext.Provider value={value}>{children}</IRCContext.Provider>;
}

export function useIRC() {
  const ctx = useContext(IRCContext);
  if (!ctx) throw new Error('useIRC must be used within IRCProvider');
  return ctx;
}
