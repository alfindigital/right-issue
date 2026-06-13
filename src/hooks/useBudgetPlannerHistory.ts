import { useState, useEffect } from 'react';
import { readVersioned, writeVersioned, removeKey } from '@/lib/safeStorage';

export interface BudgetPlannerHistoryItem {
  id: string;
  timestamp: number;
  stockCode?: string;
  config: {
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentAvgPrice: string;
    budget: string;
    includeExerciseFund: boolean;
    hasWarrant: boolean;
    warrantRatioOld: string;
    warrantRatioNew: string;
  };
}

const STORAGE_KEY = 'ri-budget-planner-history';
const MAX_HISTORY_ITEMS = 10;
const SCHEMA_VERSION = 1;

export const useBudgetPlannerHistory = () => {
  const [history, setHistory] = useState<BudgetPlannerHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = readVersioned<BudgetPlannerHistoryItem[]>(STORAGE_KEY, SCHEMA_VERSION);
    if (Array.isArray(stored)) setHistory(stored);

    // Multi-tab sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const fresh = readVersioned<BudgetPlannerHistoryItem[]>(STORAGE_KEY, SCHEMA_VERSION);
      setHistory(Array.isArray(fresh) ? fresh : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Save to localStorage (quota-safe, versioned)
  const saveToStorage = (items: BudgetPlannerHistoryItem[]) => {
    writeVersioned(STORAGE_KEY, SCHEMA_VERSION, items);
  };

  // Add config to history
  const addToHistory = (config: BudgetPlannerHistoryItem['config'], stockCode?: string) => {
    const newItem: BudgetPlannerHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      stockCode,
      config,
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(updated);
    saveToStorage(updated);
  };

  // Remove item
  const removeFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    saveToStorage(updated);
  };

  // Clear all
  const clearHistory = () => {
    setHistory([]);
    removeKey(STORAGE_KEY);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
};
