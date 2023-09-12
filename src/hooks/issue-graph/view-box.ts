import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../_internal-hooks";
import { Position } from "@/type";
import { Rect } from "@/utils/basic";
import { changeZoom } from "@/status/actions";

type Result = {
  /**
   * change pan of view box
   */
  movePan: (delta: Position) => void;

  /**
   * zoom in more.
   */
  zoomIn: (ratioDiff: number) => void;

  /**
   * zoom out more
   */
  zoomOut: (ratioDiff: number) => void;

  /**
   * resize svg canvas size
   */
  resize: (size: Rect) => void;

  state: {
    /**
     * calculated view box for <svg>
     */
    viewBox: number[];

    pan: Position;
    zoom: number;
  };
};

export const useViewBox = function useViewBox(): Result {
  const [zoom, setZoom] = useState(100.0);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [size, setSize] = useState<Rect>(Rect.empty());
  const dispatch = useAppDispatch();

  const viewBox = useMemo<Result["state"]["viewBox"]>(() => {
    const scale = 100 / zoom;
    const zoomedWidth = size.width * scale;
    const zoomedHeight = size.height * scale;
    const centerX = pan.x + size.width / 2;
    const centerY = pan.y + size.height / 2;

    const newMinX = centerX - zoomedWidth / 2;
    const newMinY = centerY - zoomedHeight / 2;

    return [newMinX, newMinY, zoomedWidth, zoomedHeight];
  }, [pan, size, zoom]);

  useEffect(() => {
    dispatch(changeZoom(zoom));
  }, [zoom]);

  const movePan = useCallback<Result["movePan"]>((delta) => {
    setPan((pan) => {
      return { x: pan.x + delta.x * (100 / zoom), y: pan.y + delta.y * (100 / zoom) };
    });
  }, []);

  const zoomIn = useCallback<Result["zoomIn"]>((delta) => {
    setZoom((zoom) => {
      const zoomScale = delta * 5 * (zoom / 100);

      return Math.min(200, zoom + zoomScale);
    });
  }, []);

  const zoomOut = useCallback<Result["zoomOut"]>((delta) => {
    setZoom((zoom) => {
      const zoomScale = delta * 5 * (zoom / 100);

      return Math.max(1, zoom - zoomScale);
    });
  }, []);

  const resize = useCallback<Result["resize"]>((size) => {
    setSize(size);
  }, []);

  return { movePan, resize, zoomIn, zoomOut, state: { viewBox: viewBox, pan, zoom } };
};
