import { useState, useEffect } from 'react';

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

export const useBudgetPlannerHistory = () => {
  const [history, setHistory] = useState<BudgetPlannerHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load budget planner history:', e);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (items: BudgetPlannerHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save budget planner history:', e);
    }
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
};
