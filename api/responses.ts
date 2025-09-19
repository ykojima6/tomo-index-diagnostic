import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRecentResponses, persistResponse, type ResponseRecord } from './response-store';

const DEFAULT_COUNT = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { answers, result } = req.body ?? {};

      if (!Array.isArray(answers) || !result || typeof result !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      if (
        typeof result.totalScore !== 'number' ||
        typeof result.positiveScore !== 'number' ||
        typeof result.negativeScore !== 'number'
      ) {
        return res.status(400).json({ error: 'Invalid result payload' });
      }

      const sanitizedAnswers = answers
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => ({
          questionId: Number((entry as { questionId: unknown }).questionId),
          value: Number((entry as { value: unknown }).value),
        }))
        .filter((entry) => Number.isFinite(entry.questionId) && Number.isFinite(entry.value));

      const newResponse: ResponseRecord = {
        id: generateId(),
        timestamp: Date.now(),
        answers: sanitizedAnswers,
        totalScore: result.totalScore,
        positiveScore: result.positiveScore,
        negativeScore: result.negativeScore,
      };

      const { persistedToKv } = await persistResponse(newResponse);
      console.log('Response saved:', {
        id: newResponse.id,
        totalScore: newResponse.totalScore,
        persistedToKv,
      });
      return res.status(200).json({ success: true, id: newResponse.id });
    }

    if (req.method === 'GET') {
      const requested = Number.parseInt(req.query.count as string, 10);
      const count = Number.isFinite(requested) && requested > 0 ? requested : DEFAULT_COUNT;

      const { responses: recent, source } = await fetchRecentResponses(count);

      console.log('Retrieved responses:', {
        source,
        requested: count,
        returned: recent.length,
      });
      
      // Filter out 0-point responses (all default answers)
      const filtered = recent.filter(r => r.totalScore !== 0);
      
      if (filtered.length === 0) {
        return res.status(200).json({
          count: 0,
          average: 0,
          median: 0,
          min: 0,
          max: 0,
          totalCount: recent.length,
        });
      }

      const scores = filtered.map(r => r.totalScore);
      const sum = scores.reduce((acc, score) => acc + score, 0);
      const average = sum / scores.length;

      // Calculate median
      const sortedScores = [...scores].sort((a, b) => a - b);
      const median = sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
        : sortedScores[Math.floor(sortedScores.length / 2)];

      const stats = {
        count: filtered.length,
        average: Number(average.toFixed(2)),
        median: Number(median.toFixed(2)),
        min: Math.min(...scores),
        max: Math.max(...scores),
        totalCount: recent.length,
      };

      console.log('Calculated statistics:', stats);
      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
