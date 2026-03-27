import { create } from "zustand";

type CacheRecord = Record<string, unknown>;
type InFlightRecord = Record<string, Promise<unknown>>;

interface FetchOptions {
  force?: boolean;
}

interface AppCacheStore {
  cache: CacheRecord;
  inFlight: InFlightRecord;
  getCachedData: <T>(key: string) => T | undefined;
  setCachedData: <T>(key: string, data: T) => void;
  fetchCachedData: <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: FetchOptions
  ) => Promise<T>;
  clearCachedData: (key: string) => void;
  clearCachedDataByPrefix: (prefix: string) => void;
}

const omitKey = <T extends Record<string, unknown>>(source: T, key: string): T => {
  const next = { ...source };
  delete next[key];
  return next;
};

const omitKeysByPrefix = <T extends Record<string, unknown>>(
  source: T,
  prefix: string
): T => {
  const next = { ...source };

  Object.keys(next).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete next[key];
    }
  });

  return next;
};

export const useAppCacheStore = create<AppCacheStore>((set, get) => ({
  cache: {},
  inFlight: {},
  getCachedData: <T,>(key: string) => get().cache[key] as T | undefined,
  setCachedData: <T,>(key: string, data: T) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: data,
      },
    })),
  fetchCachedData: async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    options?: FetchOptions
  ) => {
    const { force = false } = options || {};
    const { cache, inFlight } = get();

    if (!force && key in cache) {
      return cache[key] as T;
    }

    if (!force && inFlight[key]) {
      return inFlight[key] as Promise<T>;
    }

    const request = fetcher()
      .then((data) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: data,
          },
          inFlight: omitKey(state.inFlight, key),
        }));

        return data;
      })
      .catch((error) => {
        set((state) => ({
          inFlight: omitKey(state.inFlight, key),
        }));

        throw error;
      });

    set((state) => ({
      inFlight: {
        ...state.inFlight,
        [key]: request,
      },
    }));

    return request;
  },
  clearCachedData: (key: string) =>
    set((state) => ({
      cache: omitKey(state.cache, key),
      inFlight: omitKey(state.inFlight, key),
    })),
  clearCachedDataByPrefix: (prefix: string) =>
    set((state) => ({
      cache: omitKeysByPrefix(state.cache, prefix),
      inFlight: omitKeysByPrefix(state.inFlight, prefix),
    })),
}));
