import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ResponseRecord {
  id: string;
  timestamp: number;
  answers: Array<{ questionId: number; value: number }>;
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
}

// In-memory storage (for demo - in production, use a real database)
let responses: ResponseRecord[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { answers, result } = req.body;
      
      const newResponse: ResponseRecord = {
        id: generateId(),
        timestamp: Date.now(),
        answers,
        totalScore: result.totalScore,
        positiveScore: result.positiveScore,
        negativeScore: result.negativeScore,
      };

      // Add to beginning of array and limit to 1000 records
      responses.unshift(newResponse);
      if (responses.length > 1000) {
        responses = responses.slice(0, 1000);
      }

      return res.status(200).json({ success: true, id: newResponse.id });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  if (req.method === 'GET') {
    const count = parseInt(req.query.count as string) || 30;
    const recent = responses.slice(0, count);
    
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

    return res.status(200).json({
      count: filtered.length,
      average: Number(average.toFixed(2)),
      median: Number(median.toFixed(2)),
      min: Math.min(...scores),
      max: Math.max(...scores),
      totalCount: recent.length,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}