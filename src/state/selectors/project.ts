import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Loading } from "@/type";

const selectSelf = (state: RootState) => state;
const selectProject = createDraftSafeSelector(selectSelf, (state) => state.project);
const selectApiCredential = createDraftSafeSelector(selectSelf, (state) => state.apiCredential);

/**
 * query project and loading
 */
export const queryProject = () => {
  return createDraftSafeSelector(
    selectProject,
    (project) => [project.loading, project.loading === Loading.Loading ? undefined : project.project] as const,
  );
};

/**
 * select current search condition
 */
export const selectSearchCondition = () => {
  return createDraftSafeSelector(selectProject, (project) => {
    return project.searchCondition;
  });
};

/**
 * get flag to be able to edit search condition
 */
export const isSearchConditionEditable = () =>
  createDraftSafeSelector(selectApiCredential, selectProject, (apiCredential, project) =>
    apiCredential.credential && project.project ? true : false,
  );
