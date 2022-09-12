import { makeStorageDriver, StorageIntf, StorageSink } from "@/drivers/storage";
import { suite } from "uvu";
import xs from "xstream";
import sinon from "sinon";
import assert from "assert";

const test = suite("Drivers/Storage");

let mock: StorageIntf;

test.before(() => {
  mock = {
    setItem: sinon.fake(),
    getItem: sinon.fake.returns(null),
  };
});

test("do not fluid value if storage has not data", async () => {
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
    driver(xs.of<StorageSink>(undefined))
      .select<string>("key")
      .subscribe({
        next(v) {
          assert.equal(v, "value");
          resolve();
        },
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
    driver(xs.of<StorageSink>({ new: { nested: 1 } }));

    setTimeout(() => {
      assert.ok(setItem.calledWith("root", JSON.stringify({ key: "value", new: { nested: 1 } })));

      resolve();
    }, 50);
  });
});

test.run();
