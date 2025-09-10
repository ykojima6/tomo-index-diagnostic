import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ResponseRecord {
  id: string;
  timestamp: number;
  answers: Array<{ questionId: number; value: number }>;
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
}

// Simple database using environment variable storage
// For production, consider using Supabase, PlanetScale, or Firebase
let globalResponses: ResponseRecord[] = [];

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

      // Add to global array (will persist during function lifecycle)
      globalResponses.unshift(newResponse);
      if (globalResponses.length > 1000) {
        globalResponses = globalResponses.slice(0, 1000);
      }

      console.log('Response saved:', newResponse.id, newResponse.totalScore, 'Total responses:', globalResponses.length);
      
      // Return success with current statistics
      const filtered = globalResponses.filter(r => r.totalScore !== 0);
      return res.status(200).json({ 
        success: true, 
        id: newResponse.id,
        totalResponses: globalResponses.length,
        filteredResponses: filtered.length
      });
    }

    if (req.method === 'GET') {
      const count = parseInt(req.query.count as string) || 30;
      const recent = globalResponses.slice(0, count);
      
      console.log('GET request - Total responses in memory:', globalResponses.length);
      
      // Filter out 0-point responses
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

      console.log('Returning statistics:', stats);
      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}