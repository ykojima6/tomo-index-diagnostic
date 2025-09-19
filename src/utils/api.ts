import { DiagnosticAnswer, DiagnosticResult } from '../types';

const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? `${window.location.origin}/api`
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
    console.log('Saving to server:', { API_BASE, totalScore: result.totalScore });
    
    const response = await fetch(`${API_BASE}/simple-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers, result }),
    });

    console.log('Server response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Save successful:', data);
    return data;
  } catch (error) {
    console.error('Failed to save response to server:', error);
    return { success: false };
  }
};

// Get statistics from server
export const getStatisticsFromServer = async (count: number = 30): Promise<ApiStatistics> => {
  try {
    console.log('Fetching statistics from server:', { API_BASE, count });
    
    const response = await fetch(`${API_BASE}/simple-db?count=${count}`);
    
    console.log('Statistics response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Statistics error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Statistics received:', data);
    return data;
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
    const response = await fetch(`${API_BASE}/simple-db?count=1`);
    return response.ok;
  } catch {
    return false;
  }
};