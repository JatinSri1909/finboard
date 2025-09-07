'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
  showWelcome: boolean;
  apiProvider: 'alphavantage' | 'finnhub' | 'indian';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'US' | 'EU' | 'IN';
}

export interface UserPreferences {
  favoriteSymbols: string[];
  recentSearches: string[];
  customWatchlists: Array<{
    id: string;
    name: string;
    symbols: string[];
    createdAt: Date;
  }>;
  dashboardLayouts: Array<{
    id: string;
    name: string;
    layout: string;
    isDefault: boolean;
    createdAt: Date;
  }>;
}

interface AppSettingsStore {
  settings: AppSettings;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Settings management
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // Preferences management
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Watchlist management
  createWatchlist: (name: string, symbols: string[]) => void;
  updateWatchlist: (id: string, updates: { name?: string; symbols?: string[] }) => void;
  deleteWatchlist: (id: string) => void;

  // Layout management
  saveLayout: (name: string, layout: string, isDefault?: boolean) => void;
  loadLayout: (id: string) => string | null;
  deleteLayout: (id: string) => void;
  setDefaultLayout: (id: string) => void;

  // Data management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Backup and restore
  exportData: () => string;
  importData: (data: string) => boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  autoRefresh: true,
  refreshInterval: 30000,
  notifications: true,
  soundEnabled: false,
  compactMode: false,
  showWelcome: true,
  apiProvider: 'alphavantage',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'US',
};

const defaultPreferences: UserPreferences = {
  favoriteSymbols: [],
  recentSearches: [],
  customWatchlists: [],
  dashboardLayouts: [],
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      preferences: defaultPreferences,
      isLoading: false,
      error: null,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      addFavoriteSymbol: (symbol) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            favoriteSymbols: [
              ...new Set([...state.preferences.favoriteSymbols, symbol.toUpperCase()]),
            ],
          },
        }));
      },

      removeFavoriteSymbol: (symbol) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            favoriteSymbols: state.preferences.favoriteSymbols.filter(
              (s) => s !== symbol.toUpperCase()
            ),
          },
        }));
      },

      addRecentSearch: (query) => {
        set((state) => {
          const recentSearches = [
            query,
            ...state.preferences.recentSearches.filter((s) => s !== query),
          ].slice(0, 10);
          return {
            preferences: {
              ...state.preferences,
              recentSearches,
            },
          };
        });
      },

      clearRecentSearches: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            recentSearches: [],
          },
        }));
      },

      createWatchlist: (name, symbols) => {
        const newWatchlist = {
          id: `watchlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          symbols: [...new Set(symbols.map((s) => s.toUpperCase()))],
          createdAt: new Date(),
        };

        set((state) => ({
          preferences: {
            ...state.preferences,
            customWatchlists: [...state.preferences.customWatchlists, newWatchlist],
          },
        }));
      },

      updateWatchlist: (id, updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            customWatchlists: state.preferences.customWatchlists.map((w) =>
              w.id === id
                ? {
                    ...w,
                    ...updates,
                    symbols: updates.symbols
                      ? [...new Set(updates.symbols.map((s) => s.toUpperCase()))]
                      : w.symbols,
                  }
                : w
            ),
          },
        }));
      },

      deleteWatchlist: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            customWatchlists: state.preferences.customWatchlists.filter((w) => w.id !== id),
          },
        }));
      },

      saveLayout: (name, layout, isDefault = false) => {
        const newLayout = {
          id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          layout,
          isDefault,
          createdAt: new Date(),
        };

        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardLayouts: [
              ...state.preferences.dashboardLayouts.map((l) => ({
                ...l,
                isDefault: isDefault ? false : l.isDefault,
              })),
              newLayout,
            ],
          },
        }));
      },

      loadLayout: (id) => {
        const { preferences } = get();
        const layout = preferences.dashboardLayouts.find((l) => l.id === id);
        return layout?.layout || null;
      },

      deleteLayout: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardLayouts: state.preferences.dashboardLayouts.filter((l) => l.id !== id),
          },
        }));
      },

      setDefaultLayout: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardLayouts: state.preferences.dashboardLayouts.map((l) => ({
              ...l,
              isDefault: l.id === id,
            })),
          },
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      exportData: () => {
        const { settings, preferences } = get();
        return JSON.stringify({
          settings,
          preferences,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        });
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.settings && parsed.preferences) {
            set({
              settings: { ...defaultSettings, ...parsed.settings },
              preferences: { ...defaultPreferences, ...parsed.preferences },
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import data:', error);
          return false;
        }
      },
    }),
    {
      name: 'finboard-app-settings',
      version: 1,
    }
  )
);
