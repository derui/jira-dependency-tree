import { test, expect, beforeAll } from "vitest";
import sinon from "sinon";
import { BehaviorSubject } from "rxjs";
import { makeStorageDriver, StorageIntf, StorageSink } from "@/drivers/storage";

let mock: StorageIntf;

beforeAll(() => {
  mock = {
    setItem: sinon.fake(),
    getItem: sinon.fake.returns(null),
  };
});

test("do not fluid value if storage has not data", async () => {
  await new Promise<void>((resolve, reject) => {
    const driver = makeStorageDriver("key", mock);

    driver(new BehaviorSubject<StorageSink>(undefined)).select("key").subscribe(reject);

    setTimeout(() => {
      resolve();
    }, 50);
  });
});

test("fluid value if storage has data", async () => {
  await new Promise<void>((resolve, reject) => {
    mock = {
      setItem: sinon.fake(),
      getItem: sinon.fake.returns(JSON.stringify({ key: "value" })),
    };

    const driver = makeStorageDriver("root", mock);
    driver(new BehaviorSubject<StorageSink>(undefined))
      .select<string>("key")
      .subscribe((v) => {
        expect(v).toBe("value");
        resolve();
      });

    setTimeout(() => {
      reject();
    }, 50);
  });
});

test("save data ", async () => {
  await new Promise<void>((resolve) => {
    const setItem = sinon.fake();
    mock = {
      setItem,
      getItem: sinon.fake.returns(JSON.stringify({ key: "value" })),
    };

    const driver = makeStorageDriver("root", mock);
    driver(new BehaviorSubject<StorageSink>({ new: { nested: 1 } }));

    setTimeout(() => {
      expect(setItem.calledWith("root", JSON.stringify({ key: "value", new: { nested: 1 } }))).toBeTruthy();

      resolve();
    }, 50);
  });
});
