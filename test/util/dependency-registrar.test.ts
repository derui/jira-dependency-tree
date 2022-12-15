import { createDependencyRegistrar } from "@/util/dependency-registrar";
import test from "ava";

test("can registrar any type and get any type with key", (t) => {
  type dep = {
    name: number;
    name2: string;
  };
  const registar = createDependencyRegistrar<dep>();

  registar.register("name", 5);
  registar.register("name2", "foo");

  const name = registar.resolve("name");
  const name2 = registar.resolve("name2");

  t.is(name, 5);
  t.deepEqual(name2, "foo");
});

test("throw error if not found", (t) => {
  type dep = {
    name: number;
  };
  const registar = createDependencyRegistrar<dep>();

  t.throws(() => registar.resolve("name"));
});
