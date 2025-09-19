import { Redis } from '@upstash/redis';

export interface ResponseRecord {
  id: string;
  timestamp: number;
  answers: Array<{ questionId: number; value: number }>;
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
}

const RESPONSES_KEY = 'tomo_responses';
export const MAX_RESPONSES = 1000;

type DataSource = 'kv' | 'memory';

let memoryCache: ResponseRecord[] = [];
let missingConfigLogged = false;
let redisFailureLogged = false;
let redisClient: Redis | null = null;

function warnRedisUnavailable(error: unknown, action: string) {
  if (!redisFailureLogged) {
    console.warn(`Redis ${action} failed, using in-memory fallback.`, error);
    redisFailureLogged = true;
  }
}

function warnMissingRedisConfig() {
  if (!missingConfigLogged) {
    console.warn('Upstash Redis environment variables are missing. Falling back to in-memory storage.');
    missingConfigLogged = true;
  }
}

function getRedisClient(): Redis | null {
  // Support both KV and UPSTASH environment variables
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    warnMissingRedisConfig();
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({ url, token });
    } catch (error) {
      warnRedisUnavailable(error, 'initialize');
      return null;
    }
  }

  return redisClient;
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit) || Number.isNaN(limit)) {
    return 0;
  }
  if (limit <= 0) {
    return 0;
  }
  return Math.min(Math.floor(limit), MAX_RESPONSES);
}

function addToMemory(record: ResponseRecord) {
  memoryCache.unshift(record);
  if (memoryCache.length > MAX_RESPONSES) {
    memoryCache = memoryCache.slice(0, MAX_RESPONSES);
  }
}

function mergeIntoMemory(records: ResponseRecord[]) {
  if (records.length === 0) {
    return;
  }
  const seen = new Set<string>();
  const merged: ResponseRecord[] = [];

  for (const record of records) {
    if (!seen.has(record.id)) {
      merged.push(record);
      seen.add(record.id);
    }
  }

  for (const existing of memoryCache) {
    if (!seen.has(existing.id)) {
      merged.push(existing);
      seen.add(existing.id);
    }
  }

  memoryCache = merged.slice(0, MAX_RESPONSES);
}

function validateAnswer(value: unknown): value is { questionId: number; value: number } {
  return (
    Boolean(value && typeof value === 'object') &&
    typeof (value as { questionId: unknown }).questionId === 'number' &&
    typeof (value as { value: unknown }).value === 'number'
  );
}

function isResponseRecord(value: unknown): value is ResponseRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.timestamp === 'number' &&
    Array.isArray(candidate.answers) &&
    candidate.answers.every(validateAnswer) &&
    typeof candidate.totalScore === 'number' &&
    typeof candidate.positiveScore === 'number' &&
    typeof candidate.negativeScore === 'number'
  );
}

function parseRecord(raw: unknown): ResponseRecord | null {
  if (typeof raw !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (isResponseRecord(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse Redis record. Entry will be ignored.', error);
  }

  return null;
}

export async function persistResponse(record: ResponseRecord): Promise<{ persistedToKv: boolean }> {
  addToMemory(record);

  const redis = getRedisClient();

  if (!redis) {
    return { persistedToKv: false };
  }

  try {
    await redis.lpush(RESPONSES_KEY, JSON.stringify(record));
    await redis.ltrim(RESPONSES_KEY, 0, MAX_RESPONSES - 1);
    return { persistedToKv: true };
  } catch (error) {
    warnRedisUnavailable(error, 'write');
    return { persistedToKv: false };
  }
}

export async function fetchRecentResponses(limit: number): Promise<{ responses: ResponseRecord[]; source: DataSource }> {
  const safeLimit = normalizeLimit(limit);

  if (safeLimit === 0) {
    return { responses: [], source: 'memory' };
  }

  const redis = getRedisClient();

  if (!redis) {
    return { responses: memoryCache.slice(0, safeLimit), source: 'memory' };
  }

  try {
    const raw = await redis.lrange(RESPONSES_KEY, 0, safeLimit - 1);
    const parsed: ResponseRecord[] = [];

    for (const entry of raw ?? []) {
      const record = parseRecord(entry);
      if (record) {
        parsed.push(record);
      }
    }

    mergeIntoMemory(parsed);

    return { responses: parsed, source: 'kv' };
  } catch (error) {
    warnRedisUnavailable(error, 'read');
    return { responses: memoryCache.slice(0, safeLimit), source: 'memory' };
  }
}

export async function fetchAllResponses(): Promise<{ responses: ResponseRecord[]; source: DataSource }> {
  return fetchRecentResponses(MAX_RESPONSES);
}

export async function getTotalResponsesCount(): Promise<{ count: number; source: DataSource }> {
  const redis = getRedisClient();

  if (!redis) {
    return { count: memoryCache.length, source: 'memory' };
  }

  try {
    const total = await redis.llen(RESPONSES_KEY);
    return { count: typeof total === 'number' ? Math.min(total, MAX_RESPONSES) : memoryCache.length, source: 'kv' };
  } catch (error) {
    warnRedisUnavailable(error, 'size');
    return { count: memoryCache.length, source: 'memory' };
  }
}
