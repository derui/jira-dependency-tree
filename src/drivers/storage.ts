import { map, filter, Observable, Subject, distinctUntilChanged } from "rxjs";
import { filterUndefined } from "@/utils/basic";

type HashMap = { [k: string]: unknown };

export type StorageSink = HashMap | undefined;

export interface StorageSource {
  // select by key
  select<T = unknown>(key: string): Observable<T>;
}

export interface StorageIntf {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
}

export const makeStorageDriver = (
  rootKey: string,
  storage: StorageIntf,
): ((sink$: Subject<StorageSink>) => StorageSource) => {
  return (sink$) => {
    let originalHashMap: HashMap = {};
    const root = storage.getItem(rootKey);
    if (root) {
      try {
        originalHashMap = JSON.parse(root);
      } catch {}
    }

    sink$.pipe(filter(filterUndefined), distinctUntilChanged()).subscribe({
      next: (values) => {
        originalHashMap = Object.assign(originalHashMap, values);
        storage.setItem(rootKey, JSON.stringify(originalHashMap));
      },
    });

    const source$ = new Observable<HashMap>((listener) => {
      if (root) {
        listener.next(originalHashMap);
      }
    });

    return {
      select<T = unknown>(key: string): Observable<T> {
        return source$.pipe(
          filter((v) => Object.keys(v).includes(key)),
          map((v) => v[key] as T),
        );
      },
    };
  };
};
