import crypto from 'node:crypto';

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const SEND_WINDOW_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/** @type {Map<string, { code: string; expiresAt: number; attempts: number }>} */
const otpStore = new Map();

/** @type {Map<string, { count: number; windowStart: number; lastSentAt: number }>} */
const sendLimits = new Map();

/** @type {Map<string, { phone: string; expiresAt: number }>} */
const sessions = new Map();

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || '';
const SMS_DEV_MODE =
  process.env.SMS_DEV_MODE === 'true' || !TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM;

let twilioClient = null;

async function getTwilio() {
  if (twilioClient) return twilioClient;
  if (SMS_DEV_MODE) return null;
  const twilio = await import('twilio');
  twilioClient = twilio.default(TWILIO_SID, TWILIO_TOKEN);
  return twilioClient;
}

export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function checkSendLimit(phone) {
  const now = Date.now();
  let entry = sendLimits.get(phone);
  if (!entry) {
    entry = { count: 0, windowStart: now, lastSentAt: 0 };
    sendLimits.set(phone, entry);
  }
  if (now - entry.windowStart > SEND_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  if (entry.count >= MAX_SENDS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.windowStart + SEND_WINDOW_MS - now) / 1000);
    return { ok: false, error: 'Demasiados intentos. Espera unos minutos.', retryAfter };
  }
  if (now - entry.lastSentAt < OTP_COOLDOWN_MS) {
    const retryAfter = Math.ceil((entry.lastSentAt + OTP_COOLDOWN_MS - now) / 1000);
    return { ok: false, error: `Espera ${retryAfter}s para reenviar.`, retryAfter };
  }
  return { ok: true, entry };
}

async function sendSms(phone, code) {
  const body = `Lulula: tu código de verificación es ${code}. Válido 5 min. No lo compartas.`;

  if (SMS_DEV_MODE) {
    console.log(`\n  📱 [SMS DEV] ${phone} → OTP: ${code}\n`);
    return { dev: true };
  }

  const client = await getTwilio();
  await client.messages.create({ to: phone, from: TWILIO_FROM, body });
  return { dev: false };
}

export async function sendOtp(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { ok: false, status: 400, error: 'Número inválido. Usa formato internacional (+52…).' };
  }

  const limit = checkSendLimit(phone);
  if (!limit.ok) {
    return { ok: false, status: 429, error: limit.error, retryAfter: limit.retryAfter };
  }

  const code = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;

  try {
    const sms = await sendSms(phone, code);
    otpStore.set(phone, { code, expiresAt, attempts: 0 });
    limit.entry.count += 1;
    limit.entry.lastSentAt = Date.now();

    const payload = {
      ok: true,
      phone,
      expiresIn: OTP_TTL_MS / 1000,
      smsMode: sms.dev ? 'dev' : 'twilio',
    };
    if (sms.dev && process.env.NODE_ENV !== 'production') {
      payload.devCode = code;
    }
    return payload;
  } catch (err) {
    console.error('[auth] SMS error:', err.message);
    return {
      ok: false,
      status: 502,
      error: 'No se pudo enviar el SMS. Revisa Twilio o usa SMS_DEV_MODE=true.',
    };
  }
}

export function verifyOtp(rawPhone, code) {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { ok: false, status: 400, error: 'Número inválido.' };
  }

  const trimmed = String(code || '').trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return { ok: false, status: 400, error: 'Código de 6 dígitos requerido.' };
  }

  const entry = otpStore.get(phone);
  if (!entry) {
    return { ok: false, status: 400, error: 'No hay código activo. Solicita uno nuevo.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { ok: false, status: 400, error: 'Código expirado. Solicita uno nuevo.' };
  }

  entry.attempts += 1;
  if (entry.attempts > MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return { ok: false, status: 429, error: 'Demasiados intentos. Solicita un código nuevo.' };
  }

  if (entry.code !== trimmed) {
    return { ok: false, status: 401, error: 'Código incorrecto.' };
  }

  otpStore.delete(phone);

  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  sessions.set(sessionToken, { phone, expiresAt });

  return { ok: true, phone, sessionToken, expiresAt };
}

export function validateSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSession(token) {
  if (token) sessions.delete(token);
}

export function authStatus() {
  return {
    smsMode: SMS_DEV_MODE ? 'dev' : 'twilio',
    twilioConfigured: !SMS_DEV_MODE,
  };
}

/** Limpieza periódica */
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore) {
    if (now > entry.expiresAt) otpStore.delete(phone);
  }
  for (const [token, session] of sessions) {
    if (now > session.expiresAt) sessions.delete(token);
  }
}, 60_000);
