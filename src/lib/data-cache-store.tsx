'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface DataCacheStore {
  cache: Map<string, CacheEntry>;

  // Cache management
  set: <T>(key: string, data: T, ttlMs?: number) => void;
  get: <T>(key: string) => T | null;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;

  // Cache utilities
  isExpired: (key: string) => boolean;
  getSize: () => number;
  cleanup: () => void;

  // Batch operations
  setMultiple: <T>(entries: Array<{ key: string; data: T; ttl?: number }>) => void;
  getMultiple: <T>(keys: string[]) => Array<{ key: string; data: T | null }>;
}

export const useDataCacheStore = create<DataCacheStore>()(
  persist(
    (set, get) => ({
      cache: new Map(),

      set: (key, data, ttlMs = 300000) => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
            key,
          });
          return { cache: newCache };
        });
      },

      get: (key) => {
        const { cache } = get();
        const entry = cache.get(key);

        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
          get().delete(key);
          return null;
        }

        return entry.data;
      },

      has: (key) => {
        const { cache } = get();
        const entry = cache.get(key);

        if (!entry) return false;

        if (Date.now() - entry.timestamp > entry.ttl) {
          get().delete(key);
          return false;
        }

        return true;
      },

      delete: (key) => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.delete(key);
          return { cache: newCache };
        });
      },

      clear: () => {
        set({ cache: new Map() });
      },

      isExpired: (key) => {
        const { cache } = get();
        const entry = cache.get(key);

        if (!entry) return true;

        return Date.now() - entry.timestamp > entry.ttl;
      },

      getSize: () => {
        return get().cache.size;
      },

      cleanup: () => {
        const { cache } = get();
        const now = Date.now();
        const newCache = new Map();

        cache.forEach((entry, key) => {
          if (now - entry.timestamp <= entry.ttl) {
            newCache.set(key, entry);
          }
        });

        set({ cache: newCache });
      },

      setMultiple: (entries) => {
        set((state) => {
          const newCache = new Map(state.cache);

          entries.forEach(({ key, data, ttl = 300000 }) => {
            newCache.set(key, {
              data,
              timestamp: Date.now(),
              ttl,
              key,
            });
          });

          return { cache: newCache };
        });
      },

      getMultiple: (keys) => {
        const { get: getItem } = get();

        return keys.map((key) => ({
          key,
          data: getItem(key),
        }));
      },
    }),
    {
      name: 'finboard-data-cache',
      version: 1,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          try {
            const parsed = JSON.parse(str);
            return {
              ...parsed,
              state: {
                ...parsed.state,
                cache: new Map(parsed.state.cache || []),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              cache: Array.from(value.state.cache.entries()),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
