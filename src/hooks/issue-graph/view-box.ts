import { useCallback, useEffect, useMemo, useState } from "react";
import { produce } from "immer";
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

    center: Position;
  };
};

export const useViewBox = function useViewBox(): Result {
  const [panZoom, setPanZoom] = useState<{ zoom: number; pan: Position }>({
    zoom: 100.0,
    pan: { x: 0, y: 0 },
  });
  const [size, setSize] = useState<Rect>(Rect.empty());
  const dispatch = useAppDispatch();

  const center = useMemo<Result["state"]["center"]>(() => {
    return { x: panZoom.pan.x + size.width / 2, y: panZoom.pan.y + size.height / 2 };
  }, [panZoom]);

  const viewBox = useMemo<Result["state"]["viewBox"]>(() => {
    const scale = 100 / panZoom.zoom;
    const zoomedWidth = size.width * scale;
    const zoomedHeight = size.height * scale;
    const centerX = panZoom.pan.x + size.width / 2;
    const centerY = panZoom.pan.y + size.height / 2;

    const newMinX = centerX - zoomedWidth / 2;
    const newMinY = centerY - zoomedHeight / 2;

    return [newMinX, newMinY, zoomedWidth, zoomedHeight];
  }, [panZoom, size]);

  useEffect(() => {
    dispatch(changeZoom(panZoom.zoom));
  }, [panZoom.zoom]);

  const movePan = useCallback<Result["movePan"]>((delta) => {
    setPanZoom(({ pan, zoom }) => {
      return { pan: { x: pan.x + delta.x * (100 / zoom), y: pan.y + delta.y * (100 / zoom) }, zoom };
    });
  }, []);

  const zoomIn = useCallback<Result["zoomIn"]>((delta) => {
    setPanZoom((state) => {
      return produce(state, (draft) => {
        const zoomScale = delta * 5 * (draft.zoom / 100);
        const newZoom = Math.min(200, draft.zoom + zoomScale);

        draft.zoom = newZoom;
      });
    });
  }, []);

  const zoomOut = useCallback<Result["zoomOut"]>((delta) => {
    setPanZoom((state) => {
      return produce(state, (draft) => {
        const zoomScale = delta * 5 * (draft.zoom / 100);
        const newZoom = Math.max(1, draft.zoom - zoomScale);

        draft.zoom = newZoom;
      });
    });
  }, []);

  const resize = useCallback<Result["resize"]>((size) => {
    setSize(size);
  }, []);

  return { movePan, resize, zoomIn, zoomOut, state: { viewBox: viewBox, center } };
};
