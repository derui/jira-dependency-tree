import { test, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAppDispatch } from "../_internal-hooks";
import { useViewBox } from "./view-box";
import { Rect } from "@/utils/basic";
import { changeZoom } from "@/status/actions";

vi.mock("../_internal-hooks", () => {
  const mock = vi.fn();
  return {
    useAppDispatch: () => mock,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

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
    center: { x: 0, y: 0 },
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
    center: { x: 50, y: 75 },
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
    viewBox: [15, 25, 100, 150],
    center: { x: 65, y: 100 },
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
  const mocked = vi.mocked(useAppDispatch());
  expect(result.current.state).toEqual({
    viewBox: [-150, -175, 200, 300],
    center: { x: -50, y: -25 },
  });
  expect(mocked).toBeCalledWith(changeZoom(50));
});
