import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./hooks";
import { IssueKey } from "@/type";
import { Relation } from "@/model/issue";
import { RootState } from "@/state/store";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationEditor.relations,
);

/**
 * get relations for issue
 */
export const useGetRelations = function useGetRelations(key: IssueKey): Relation[] | undefined {
  const relationRecord = useAppSelector(relations);

  const relationsOfIssue = relationRecord[key] ?? {};

  return Object.values(relationsOfIssue);
};
