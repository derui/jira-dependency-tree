import { makeViewBox } from "@/drivers/issue-graph";
import { Rect } from "@/util/basic";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("drivers/issue-graph");

const rect = function rect(width: number, height: number) {
  return new Rect({ left: 0, top: 0, right: width, bottom: height });
};

test("get viewBox default", () => {
  // Arrange
  const panZoom = { pan: { x: 0, y: 0 }, zoomPercentage: 100 };

  // Do
  const result = makeViewBox(panZoom, rect(100, 150));

  // Verify
  assert.equal(result, [0, 0, 100, 150]);
});

test("get viewBox panned", () => {
  // Arrange
  const panZoom = { pan: { x: 15, y: 25 }, zoomPercentage: 100 };

  // Do
  const result = makeViewBox(panZoom, rect(100, 150));

  // Verify
  assert.equal(result, [15, 25, 100, 150]);
});

test("get viewBox zoomed", () => {
  // Arrange
  const panZoom = { pan: { x: -50, y: -50 }, zoomPercentage: 50 };

  // Do
  const result = makeViewBox(panZoom, rect(100, 150));

  // Verify
  assert.equal(result, [-100, -125, 200, 300]);
});

test.run();
