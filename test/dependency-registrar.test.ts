import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("dependency registrar");

test("can registrar any type and get any type with key", () => {
  type dep = {
    name: number;
    name2: string;
  };
  const registar = createDependencyRegistrar<dep>();

  registar.register("name", 5);
  registar.register("name2", "foo");

  const name = registar.resolve("name");
  const name2 = registar.resolve("name2");

  assert.is(name, 5);
  assert.equal(name2, "foo");
});

test("throw error if not found", () => {
  type dep = {
    name: number;
  };
  const registar = createDependencyRegistrar<dep>();

  assert.throws(() => registar.resolve("name"));
});

test.run();
