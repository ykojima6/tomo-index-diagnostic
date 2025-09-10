// Client-side HMAC-based share token utilities
// Note: In a purely static SPA, embedding a secret on the client cannot provide
// true tamper-proof security. Treat this as best-effort integrity for sharing.

import { DiagnosticAnswer } from '../types';

const textEncoder = new TextEncoder();

const getSecret = (): string => {
  // Expect Vite env var; fallback is unsafe and only for dev.
  return import.meta.env.VITE_SHARE_SECRET || 'dev-insecure-secret';
};

const importHmacKey = async (secret: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

const base64url = {
  encode: (data: Uint8Array) =>
    btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, ''),
  decode: (s: string) =>
    Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
};

const stringifyAnswers = (answers: DiagnosticAnswer[]): string => {
  // Compact representation: [ [id,value], ... ]
  const compact = answers.map((a) => [a.questionId, a.value]);
  return JSON.stringify(compact);
};

const parseAnswers = (s: string): DiagnosticAnswer[] => {
  const arr = JSON.parse(s) as [number, number][];
  return arr.map(([id, value]) => ({ questionId: id, value }));
};

export const generateShareUrl = async (baseUrl: string, answers: DiagnosticAnswer[]) => {
  const ts = Date.now().toString();
  const payload = `${stringifyAnswers(answers)}|${ts}`;
  const key = await importHmacKey(getSecret());
  const sigBuf = await crypto.subtle.sign('HMAC', key, textEncoder.encode(payload));
  const sig = base64url.encode(new Uint8Array(sigBuf));
  const data = base64url.encode(textEncoder.encode(stringifyAnswers(answers)));
  const url = new URL(baseUrl);
  url.searchParams.set('data', data);
  url.searchParams.set('ts', ts);
  url.searchParams.set('sig', sig);
  return url.toString();
};

export const validateShareParams = async (
  dataB64: string,
  ts: string,
  sig: string
): Promise<{ valid: boolean; answers?: DiagnosticAnswer[]; error?: string }> => {
  try {
    if (!dataB64 || !ts || !sig) return { valid: false, error: 'パラメータが不足しています。' };
    // 24h validity window
    const maxAgeMs = 1000 * 60 * 60 * 24;
    const now = Date.now();
    const tsNum = Number(ts);
    if (!Number.isFinite(tsNum)) return { valid: false, error: 'タイムスタンプが不正です。' };
    if (now - tsNum > maxAgeMs) return { valid: false, error: '共有URLの有効期限が切れています。' };

    const answersJson = new TextDecoder().decode(base64url.decode(dataB64));
    const answers = parseAnswers(answersJson);
    const payload = `${answersJson}|${ts}`;
    const key = await importHmacKey(getSecret());
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      base64url.decode(sig),
      textEncoder.encode(payload)
    );
    if (!ok) return { valid: false, error: '署名の検証に失敗しました。' };
    return { valid: true, answers };
  } catch (e) {
    return { valid: false, error: '共有URLの解析に失敗しました。' };
  }
};

