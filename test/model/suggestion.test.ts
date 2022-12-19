import test from "ava";
import { suggestionFactory } from "@/model/suggestion";

test("empty sprints", (t) => {
  // arrange

  // do
  const setting = suggestionFactory({});

  // verify
  t.deepEqual(setting.sprints, []);
});

test("use given sprint with id", (t) => {
  // arrange
  const sprints = [
    { value: "foo", displayName: "bar" },
    { value: "value", displayName: "display" },
  ];

  // do
  const setting = suggestionFactory({ sprints });

  // verify
  t.deepEqual(setting.sprints, [
    { id: "0", value: "foo", displayName: "bar" },
    { id: "1", value: "value", displayName: "display" },
  ]);
});
