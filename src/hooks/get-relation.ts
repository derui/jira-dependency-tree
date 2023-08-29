import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { IssueKey, IssueRelationId } from "@/type";
import { Issue } from "@/model/issue";
import { RootState } from "@/state/store";
import { IssueModel } from "@/view-models/issue";
import { filterUndefined } from "@/util/basic";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationEditor.relations,
);

const issues = createDraftSafeSelector(
  (state: RootState) => state,
  (state) =>
    state.issues.issues.reduce<Record<IssueKey, Issue>>((accum, v) => {
      accum[v.key] = v;

      return accum;
    }, {}),
);

interface IssueWithRelation {
  relationId: IssueRelationId;
  issue: IssueModel;
}

interface Result {
  inwardIssues: IssueWithRelation[];
  outwardIssues: IssueWithRelation[];
}

/**
 * get relations for issue
 */
export const useGetRelations = function useGetRelations(key: IssueKey): Result {
  const relationRecord = useAppSelector(relations);
  const issueRecord = useAppSelector(issues);

  const relationsOfIssue = Object.values(relationRecord[key] ?? {});
  const inwardIssues = relationsOfIssue.map((v) => [v.id, v.inwardIssue] as const);
  const outwardIssues = relationsOfIssue.map((v) => [v.id, v.outwardIssue] as const);

  return {
    inwardIssues: inwardIssues
      .map(([id, issueKey]) => {
        const issue = issueRecord[issueKey];
        if (!issue) {
          return undefined;
        }

        return { relationId: id, issue };
      })
      .filter(filterUndefined),
    outwardIssues: outwardIssues
      .map(([id, issueKey]) => {
        const issue = issueRecord[issueKey];
        if (!issue) {
          return undefined;
        }

        return { relationId: id, issue };
      })
      .filter(filterUndefined),
  };
};
