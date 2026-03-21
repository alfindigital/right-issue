import { useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'ri-calculator-autosave';
const DEBOUNCE_MS = 500;

export interface AutoSaveData {
  stockCode: string;
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  currentLots: string;
  currentAvgPrice: string;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
  savedAt: number;
}

export const useAutoSave = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToStorage = useCallback((data: Omit<AutoSaveData, 'savedAt'>) => {
    // Debounce saves
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const saveData: AutoSaveData = {
        ...data,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }, DEBOUNCE_MS);
  }, []);

  const loadFromStorage = useCallback((): AutoSaveData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved) as AutoSaveData;
      
      // Only restore if saved within last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (data.savedAt < sevenDaysAgo) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }, []);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveToStorage, loadFromStorage, clearStorage };
};
