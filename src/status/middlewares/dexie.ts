import Dexie from "dexie";
import { Middleware } from "redux";

interface Options {
  /**
   * enable dexie middleware. default is `false`
   */
  readonly enabled?: boolean;

  /**
   * database name. default is `JiraDependencyTreeDatabase`
   */
  readonly databaseName?: string;

  /**
   * interval milliseconds to save state. Default is `500`
   */
  readonly throttleInterval?: number;

  /**
   * count of cache. Default is `5`
   */
  readonly cacheCount?: number;
}

/**
 * get latest cache from database if exists. Return `undefined` if no cache is exists.
 */
export const getLatestCache = async function getLatestCache<T>(
  databaseName = "JiraDependencyTreeDatabase",
): Promise<T | undefined> {
  const db = new Dexie(databaseName);
  db.version(1).stores({ caches: "++id" });

  const cache = await db.table("caches").orderBy("id").reverse().first();

  return cache?.cache as T;
};

/**
 * create middleware to store state into dexie
 */
export const createDexieMiddleware = function createDexieMiddleware(options: Options): Middleware {
  const {
    enabled = false,
    databaseName = "JiraDependencyTreeDatabase",
    throttleInterval = 500,
    cacheCount = 5,
  } = options;

  if (!enabled) {
    return () => (next) => (action) => next(action);
  }

  const correctedThrottle = Math.max(0, throttleInterval);
  const correctedCacheCount = Math.max(0, cacheCount);
  let timeout: NodeJS.Timeout | null = null;
  const db = new Dexie(databaseName);

  db.version(1).stores({ caches: "++id" });

  return ({ getState }) => {
    return (next) => async (action) => {
      next(action);

      const state = getState();

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        await db.transaction("readwrite", "caches", async () => {
          const id = await db.table("caches").add({ cache: state });

          const count = await db.table("caches").count();
          if (count > correctedCacheCount) {
            await db.table("caches").where("id").below(id).delete();
          }
        });
      }, correctedThrottle);
    };
  };
};
