import { test, expect } from "vitest";
import { mapKey, mapValue } from "./record";

test("map key of object", () => {
  // Arrange
  const v = { test: 1, test2: "2", test3: [1, 2, 3] };

  // Act

  const ret = mapKey(v, (k) => `${k}-test`);

  // Assert
  expect(ret).toStrictEqual({
    "test-test": 1,
    "test2-test": "2",
    "test3-test": v.test3,
  });
});

test("map value of object", () => {
  // Arrange
  const v = { test: 1, test2: "2", test3: [1, 2, 3] };

  // Act

  const ret = mapValue(v, (v) => {
    if (typeof v === "string") {
      return `mapped ${v}`;
    }
    return;
  });

  // Assert
  expect(ret).toStrictEqual({
    test2: "mapped 2",
  });
});
