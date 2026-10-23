// In-memory fallback if localStorage throws or is blocked by Brave Shields
const memoryFallback: Record<string, string> = {};

export const safeStorage = {
  get: (k: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(k);
      }
    } catch {
      // If navigator.brave or localStorage throws, don't crash, just continue
    }
    return memoryFallback[k] ?? null;
  },
  set: (k: string, v: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(k, v);
      }
    } catch {
      // If navigator.brave or localStorage throws, don't crash, just continue
    }
    memoryFallback[k] = v;
  },
  getItem: (k: string): string | null => safeStorage.get(k),
  setItem: (k: string, v: string): void => safeStorage.set(k, v),
  key: (index: number): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.key(index);
      }
    } catch {}
    return Object.keys(memoryFallback)[index] ?? null;
  },
  get length(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.length;
      }
    } catch {}
    return Object.keys(memoryFallback).length;
  }
};
