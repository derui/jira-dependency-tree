import { makeStorageDriver, StorageIntf, StorageSink } from "@/drivers/storage";
import test from "ava";
import xs from "xstream";
import sinon from "sinon";

let mock: StorageIntf;

test.before(() => {
  mock = {
    setItem: sinon.fake(),
    getItem: sinon.fake.returns(null),
  };
});

test("do not fluid value if storage has not data", async (t) => {
  await new Promise<void>((resolve, reject) => {
    const driver = makeStorageDriver("key", mock);

    driver(xs.of<StorageSink>(undefined))
      .select("key")
      .subscribe({
        next() {
          reject();
        },
      });

    setTimeout(() => {
      t.pass();
      resolve();
    }, 50);
  });
});

test("fluid value if storage has data", async (t) => {
  await new Promise<void>((resolve, reject) => {
    mock = {
      setItem: sinon.fake(),
      getItem: sinon.fake.returns(JSON.stringify({ key: "value" })),
    };

    const driver = makeStorageDriver("root", mock);
    driver(xs.of<StorageSink>(undefined))
      .select<string>("key")
      .subscribe({
        next(v) {
          t.deepEqual(v, "value");
          resolve();
        },
      });

    setTimeout(() => {
      reject();
    }, 50);
  });
});

test("save data ", async (t) => {
  await new Promise<void>((resolve) => {
    const setItem = sinon.fake();
    mock = {
      setItem,
      getItem: sinon.fake.returns(JSON.stringify({ key: "value" })),
    };

    const driver = makeStorageDriver("root", mock);
    driver(xs.of<StorageSink>({ new: { nested: 1 } }));

    setTimeout(() => {
      t.true(setItem.calledWith("root", JSON.stringify({ key: "value", new: { nested: 1 } })));

      resolve();
    }, 50);
  });
});
