import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

const selectSelf = (state: RootState) => state;
const selectZoom = createDraftSafeSelector(selectSelf, (state) => state.zoom);

export const getZoom = () => createDraftSafeSelector(selectZoom, (state) => state.zoomPercentage);
