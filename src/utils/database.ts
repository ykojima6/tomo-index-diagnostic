// 回答データの管理とローカルストレージへの保存
import { DiagnosticAnswer, DiagnosticResult } from '../types';

export interface ResponseRecord {
  id: string;
  timestamp: number;
  answers: DiagnosticAnswer[];
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
}

const STORAGE_KEY = 'tomo_responses';
const MAX_RECORDS = 1000; // 最大保存件数

// ローカルストレージから全ての回答データを取得
export const getAllResponses = (): ResponseRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading responses:', error);
    return [];
  }
};

// 新しい回答データを保存
export const saveResponse = (answers: DiagnosticAnswer[], result: DiagnosticResult): void => {
  try {
    const responses = getAllResponses();
    const newResponse: ResponseRecord = {
      id: generateId(),
      timestamp: Date.now(),
      answers,
      totalScore: result.totalScore,
      positiveScore: result.positiveScore,
      negativeScore: result.negativeScore,
    };

    // 新しい回答を先頭に追加
    responses.unshift(newResponse);

    // 最大件数を超えた場合は古いデータを削除
    if (responses.length > MAX_RECORDS) {
      responses.splice(MAX_RECORDS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  } catch (error) {
    console.error('Error saving response:', error);
  }
};

// 直近30件の統計データを計算（デフォルト回答の0点を除外）
export const getRecentStatistics = (count: number = 30) => {
  const responses = getAllResponses();
  const recent = responses.slice(0, count);

  if (recent.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      totalCount: 0,
    };
  }

  // 0点（すべてデフォルト値4で回答）の人を除外
  const filteredScores = recent
    .filter(r => r.totalScore !== 0)
    .map(r => r.totalScore);

  if (filteredScores.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      totalCount: recent.length,
    };
  }

  const sum = filteredScores.reduce((acc, score) => acc + score, 0);
  const average = sum / filteredScores.length;

  // 中央値の計算
  const sortedScores = [...filteredScores].sort((a, b) => a - b);
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];

  return {
    count: filteredScores.length,
    average: Number(average.toFixed(2)),
    median: Number(median.toFixed(2)),
    min: Math.min(...filteredScores),
    max: Math.max(...filteredScores),
    totalCount: recent.length,
  };
};

// ユニークIDの生成
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// データのエクスポート（管理用）
export const exportData = (): string => {
  const responses = getAllResponses();
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalRecords: responses.length,
    data: responses,
  }, null, 2);
};

// データのクリア（開発・テスト用）
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// データ移行用のヘルパー関数
export const migrateToServer = async (endpoint: string): Promise<boolean> => {
  try {
    const responses = getAllResponses();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    });
    return response.ok;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};