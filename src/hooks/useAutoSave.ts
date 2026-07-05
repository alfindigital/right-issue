import { useEffect, useCallback, useRef } from 'react';
import { readVersioned, writeVersioned, removeKey } from '@/lib/safeStorage';

const STORAGE_KEY = 'ri-calculator-autosave';
const DEBOUNCE_MS = 500;
const SCHEMA_VERSION = 2;

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
  noOwnership: boolean;
  hmetdLots: string;
  hmetdPrice: string;
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
      writeVersioned(STORAGE_KEY, SCHEMA_VERSION, saveData);
    }, DEBOUNCE_MS);
  }, []);

  const loadFromStorage = useCallback((): AutoSaveData | null => {
    // Try current version first, then migrate v1 → v2 (new noOwnership fields).
    let data = readVersioned<AutoSaveData>(STORAGE_KEY, SCHEMA_VERSION);
    if (!data) {
      const v1 = readVersioned<Omit<AutoSaveData, 'noOwnership' | 'hmetdLots' | 'hmetdPrice'>>(STORAGE_KEY, 1);
      if (v1) {
        data = { ...v1, noOwnership: false, hmetdLots: '', hmetdPrice: '' } as AutoSaveData;
      }
    }
    if (!data) return null;
    // Only restore if saved within last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (!data.savedAt || data.savedAt < sevenDaysAgo) {
      removeKey(STORAGE_KEY);
      return null;
    }
    return data;
  }, []);

  const clearStorage = useCallback(() => {
    removeKey(STORAGE_KEY);
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
