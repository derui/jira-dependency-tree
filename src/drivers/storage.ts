import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import { filterUndefined } from "@/util/basic";

type HashMap = { [k: string]: unknown };

export type StorageSink = HashMap | undefined;

export interface StorageSource {
  // select by key
  select<T = unknown>(key: string): Stream<T>;
}

export interface StorageIntf {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
}

export const makeStorageDriver = function makeStorageDriver(
  rootKey: string,
  storage: StorageIntf
): Driver<Stream<StorageSink>, StorageSource> {
  return function StorageDriver(sink$) {
    let originalHashMap: HashMap = {};
    const root = storage.getItem(rootKey);
    if (root) {
      try {
        originalHashMap = JSON.parse(root);
      } catch {}
    }

    sink$.filter(filterUndefined).subscribe({
      next: (values) => {
        originalHashMap = Object.assign(originalHashMap, values);
        storage.setItem(rootKey, JSON.stringify(originalHashMap));
      },
    });

    const source$ = xs.createWithMemory<HashMap>({
      start: (listener) => {
        if (root) {
          listener.next(originalHashMap);
        }
      },
      stop() {},
    });

    return {
      select<T = unknown>(key: string): Stream<T> {
        return source$.filter((v) => Object.keys(v).includes(key)).map((v) => v[key] as T);
      },
    };
  };
};
