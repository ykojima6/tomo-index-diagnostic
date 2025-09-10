import { DiagnosticAnswer, DiagnosticResult } from '../types';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://tomo-index-diagnostic-kup1li1qo-ykojima6-gmailcoms-projects.vercel.app/api'
  : '/api';

export interface ApiStatistics {
  count: number;
  average: number;
  median: number;
  min: number;
  max: number;
  totalCount: number;
}

// Save response to server
export const saveResponseToServer = async (
  answers: DiagnosticAnswer[], 
  result: DiagnosticResult
): Promise<{ success: boolean; id?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers, result }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to save response to server:', error);
    return { success: false };
  }
};

// Get statistics from server
export const getStatisticsFromServer = async (count: number = 30): Promise<ApiStatistics> => {
  try {
    const response = await fetch(`${API_BASE}/responses?count=${count}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch statistics from server:', error);
    // Fallback to local storage
    const { getRecentStatistics } = await import('./database');
    return getRecentStatistics(count);
  }
};

// Check if server API is available
export const isServerAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/responses?count=1`);
    return response.ok;
  } catch {
    return false;
  }
};