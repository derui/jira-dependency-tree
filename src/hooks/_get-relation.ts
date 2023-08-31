import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { RootState } from "@/state/store";
import { issueToIssueModel } from "@/view-models/issue";
import { filterUndefined } from "@/util/basic";
import { RelationModel } from "@/model/relation";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relations.relations,
);

const issues = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.issues.issues,
);

interface Result {
  relations: RelationModel[];
}

/**
 * get relations for issue
 */
export const useGetRelations = function useGetRelations(): Result {
  const relationRecord = useAppSelector(relations);
  const issueRecord = useAppSelector(issues);
  const entries = Object.entries(relationRecord);

  return {
    relations: entries
      .map(([id, relation]) => {
        const inward = issueRecord[relation.inwardIssue];
        const outward = issueRecord[relation.outwardIssue];
        if (!inward || !outward) {
          return undefined;
        }

        return { relationId: id, inward: issueToIssueModel(inward), outward: issueToIssueModel(outward) };
      })
      .filter(filterUndefined),
  };
};
