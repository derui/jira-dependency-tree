import { suggestionFactory } from "@/model/suggestion";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("model/suggestion");

test("empty sprints", () => {
  // arrange

  // do
  const setting = suggestionFactory({});

  // verify
  assert.equal(setting.sprints, []);
});

test("use given sprint with id", () => {
  // arrange
  const sprints = [
    { value: "foo", displayName: "bar" },
    { value: "value", displayName: "display" },
  ];

  // do
  const setting = suggestionFactory({ sprints });

  // verify
  assert.equal(setting.sprints, [
    { id: "0", value: "foo", displayName: "bar" },
    { id: "1", value: "value", displayName: "display" },
  ]);
});

test.run();
