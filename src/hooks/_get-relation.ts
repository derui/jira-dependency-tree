import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { RootState } from "@/state/store";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";
import { filterUndefined } from "@/util/basic";
import { RelationModel } from "@/model/relation";
import { IssueKey } from "@/type";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relations.relations,
);

const issues = createDraftSafeSelector(
  (state: RootState) => state,
  (state): Record<IssueKey, IssueModel> => {
    const ret: Record<IssueKey, IssueModel> = {};
    for (const [key, issue] of Object.entries(state.issues.issues)) {
      ret[key] = issueToIssueModel(issue);
    }

    return ret;
  },
);

interface Result {
  issues: Record<IssueKey, IssueModel>;
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
    issues: issueRecord,
    relations: entries
      .map(([id, relation]) => {
        const inward = issueRecord[relation.inwardIssue];
        const outward = issueRecord[relation.outwardIssue];
        if (!inward || !outward) {
          return undefined;
        }

        return { relationId: id, inward, outward };
      })
      .filter(filterUndefined),
  };
};
