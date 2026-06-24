import { HTTP_BRIDGE } from '@/constants/config';

export type SendOtpResult = {
  ok: boolean;
  phone?: string;
  expiresIn?: number;
  smsMode?: 'dev' | 'twilio';
  devCode?: string;
  error?: string;
  retryAfter?: number;
};

export type VerifyOtpResult = {
  ok: boolean;
  phone?: string;
  sessionToken?: string;
  expiresAt?: number;
  error?: string;
};

async function postJson<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${HTTP_BRIDGE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok && !('ok' in data)) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function sendOtpApi(phone: string): Promise<SendOtpResult> {
  try {
    return await postJson<SendOtpResult>('/auth/send-otp', { phone });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error de red' };
  }
}

export async function verifyOtpApi(phone: string, code: string): Promise<VerifyOtpResult> {
  try {
    return await postJson<VerifyOtpResult>('/auth/verify-otp', { phone, code });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error de red' };
  }
}

export async function fetchAuthStatus(): Promise<{ smsMode: string; twilioConfigured: boolean }> {
  try {
    const res = await fetch(`${HTTP_BRIDGE}/auth/status`);
    return res.json();
  } catch {
    return { smsMode: 'unknown', twilioConfigured: false };
  }
}
