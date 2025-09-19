import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ResponseRecord {
  id: string;
  timestamp: number;
  answers: Array<{ questionId: number; value: number }>;
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
}

// Simple in-memory storage with Vercel Edge Config as backup
let memoryCache: ResponseRecord[] = [];

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
      const { answers, result } = req.body;
      
      const newResponse: ResponseRecord = {
        id: generateId(),
        timestamp: Date.now(),
        answers,
        totalScore: result.totalScore,
        positiveScore: result.positiveScore,
        negativeScore: result.negativeScore,
      };

      // Add to memory cache
      memoryCache.unshift(newResponse);
      if (memoryCache.length > 1000) {
        memoryCache = memoryCache.slice(0, 1000);
      }

      console.log('Response saved to memory:', newResponse.id, newResponse.totalScore, 'Total:', memoryCache.length);
      return res.status(200).json({ success: true, id: newResponse.id });
    }

    if (req.method === 'GET') {
      const count = parseInt(req.query.count as string) || 30;
      
      // Get responses from memory
      const recent = memoryCache.slice(0, count);
      
      console.log('Retrieved responses from memory:', memoryCache.length, 'recent:', recent.length);
      
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