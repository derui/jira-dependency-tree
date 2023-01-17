import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const selectSelf = (state: RootState) => state;
const selectGraphLayout = createDraftSafeSelector(selectSelf, (state) => state.graphLayout);

export const getGraphLayout = () => {
  return createDraftSafeSelector(selectGraphLayout, (state) => state.graphLayout);
};
