import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { SuggestedItem } from "@/model/suggestion";
import { Loading } from "@/type";

// define and export selector function.
const selectSelf = (state: RootState) => state;
const selectProjects = createDraftSafeSelector(selectSelf, (state) => state.projects);

export const selectProjectSuggestions = createDraftSafeSelector(selectProjects, (state): [Loading, SuggestedItem[]] => {
  if (state.loading !== Loading.Completed) {
    return [state.loading, []];
  }

  const values = Object.values(state.projects)
    .map((v): SuggestedItem => {
      return { id: v.id, value: v.id, displayName: `${v.key} | ${v.name}` };
    })
    .sort((v1, v2) => v1.displayName.localeCompare(v2.displayName));

  return [Loading.Completed, values];
});
