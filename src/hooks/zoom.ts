import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import type { RootState } from "@/state/store";

const selector = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.zoom.zoomPercentage,
);

/**
 * the hook to get api credential currently enabled
 */
export const useZoom = function useZoom() {
  const zoom = useAppSelector(selector);

  return zoom;
};
