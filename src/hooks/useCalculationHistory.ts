import { useState, useEffect, useCallback } from 'react';
import { readVersioned, writeVersioned, removeKey } from '@/lib/safeStorage';

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  stockCode?: string;
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
const SCHEMA_VERSION = 1;

export const useCalculationHistory = () => {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = readVersioned<CalculationHistoryItem[]>(STORAGE_KEY, SCHEMA_VERSION);
    if (Array.isArray(stored)) setHistory(stored);

    // Multi-tab sync: refresh when another tab updates the same key.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const fresh = readVersioned<CalculationHistoryItem[]>(STORAGE_KEY, SCHEMA_VERSION);
      setHistory(Array.isArray(fresh) ? fresh : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Save history to localStorage (quota-safe, versioned)
  const saveToStorage = useCallback((items: CalculationHistoryItem[]) => {
    writeVersioned(STORAGE_KEY, SCHEMA_VERSION, items);
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
    removeKey(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
