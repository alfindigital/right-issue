import { useState, useEffect, useCallback } from 'react';

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  inputs: {
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentLots: string;
    currentAvgPrice: string;
    hasWarrant: boolean;
    warrantRatioOld: string;
    warrantRatioNew: string;
  };
  results: {
    newSharesCount: string;
    finalShares: string;
    finalAvgPrice: string;
    finalTotalValue: string;
    theoreticalPrice: string;
    warrantCount: string;
    recommendation: 'positive' | 'negative' | null;
  };
}

const STORAGE_KEY = 'ri-calculator-history';
const MAX_HISTORY_ITEMS = 10;

export const useCalculationHistory = () => {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Save history to localStorage
  const saveToStorage = useCallback((items: CalculationHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, []);

  // Add new calculation to history
  const addToHistory = useCallback((item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Remove item from history
  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
