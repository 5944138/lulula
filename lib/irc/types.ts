export type UserMode = 'op' | 'halfop' | 'voice' | 'normal';

export type IRCUser = {
  nick: string;
  mode: UserMode;
};

export type IRCMessageType = 'chat' | 'action' | 'join' | 'part' | 'quit' | 'system' | 'notice';

export type IRCMessage = {
  id: string;
  time: string;
  type: IRCMessageType;
  nick?: string;
  text: string;
  fromMe?: boolean;
  target?: string;
  channel?: string | null;
};

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export type ChannelRoom = {
  name: string;
  topic: string;
  messages: IRCMessage[];
  users: IRCUser[];
  unread: number;
};

export type PMRoom = {
  nick: string;
  messages: IRCMessage[];
  unread: number;
};

export type WsServerEvent =
  | { type: 'hello'; message: string; server: string; version: string }
  | { type: 'connecting'; nick: string; server: string; message: string }
  | { type: 'registered'; nick: string; server: string; message: string }
  | { type: 'disconnected'; message: string }
  | { type: 'error'; message: string }
  | { type: 'message'; id: string; time: string; target: string; channel: string | null; nick: string; text: string; msgType: 'chat' | 'action'; fromMe: boolean }
  | { type: 'join'; time: string; channel: string; nick: string; fromMe: boolean; text: string }
  | { type: 'part'; time: string; channel: string; nick: string; fromMe: boolean; text: string }
  | { type: 'quit'; time: string; nick: string; text: string }
  | { type: 'nick'; time: string; oldNick: string; newNick: string; text: string }
  | { type: 'topic'; channel: string; topic: string; nick: string }
  | { type: 'nicklist'; channel: string; users: IRCUser[] }
  | { type: 'status'; away: boolean; status: string };
