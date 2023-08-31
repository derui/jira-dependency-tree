import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { IssueKey, IssueRelationId } from "@/type";
import { Issue } from "@/model/issue";
import { RootState } from "@/state/store";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";
import { filterUndefined } from "@/util/basic";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relations.relations,
);

const issues = createDraftSafeSelector(
  (state: RootState) => state,
  (state) =>
    state.issues.issues.reduce<Record<IssueKey, Issue>>((accum, v) => {
      accum[v.key] = v;

      return accum;
    }, {}),
);

interface RelationModel {
  relationId: IssueRelationId;
  inward: IssueModel;
  outward: IssueModel;
}

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
