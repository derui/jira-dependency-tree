import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useViewBox } from "./view-box";
import { Rect } from "@/utils/basic";

/**
 * utility function
 */
const rect = function rect(width: number, height: number) {
  return new Rect({ left: 0, top: 0, right: width, bottom: height });
};

test("initial view box", () => {
  const { result } = renderHook(() => useViewBox());

  expect(result.current.state).toEqual({
    viewBox: [0, 0, 0, 0],
    pan: { x: 0, y: 0 },
  });
});

test("calculate view box", () => {
  // Arrange
  const { result, rerender } = renderHook(() => useViewBox());

  // Act
  result.current.resize(rect(100, 150));
  rerender();

  // Assert
  expect(result.current.state).toEqual({
    viewBox: [0, 0, 100, 150],
    pan: { x: 0, y: 0 },
  });
});

test("calculate view box with pan", () => {
  // Arrange
  const { result, rerender } = renderHook(() => useViewBox());

  // Act
  result.current.resize(rect(100, 150));
  result.current.movePan({ x: 15, y: 25 });
  rerender();

  // Assert
  expect(result.current.state).toEqual({
    viewBox: [7.5, 12.5, 100, 150],
    pan: { x: 7.5, y: 12.5 },
  });
});

test("calculate view box with zoom", () => {
  // Arrange
  const { result, rerender } = renderHook(() => useViewBox());

  // Act
  result.current.resize(rect(100, 150));
  result.current.movePan({ x: -100, y: -100 });
  result.current.zoomOut(10);
  rerender();

  // Assert
  expect(result.current.state).toEqual({
    viewBox: [-100, -125, 200, 300],
    pan: { x: -50, y: -50 },
  });
});
