import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { selectCurrentIssueRecord } from "./_selectors/current-issues";
import { RootState } from "@/status/store";
import { IssueModel } from "@/view-models/issue";
import { IssueKey, IssueRelationId } from "@/type";
import { RelationModel } from "@/view-models/relation";
import { mapValue } from "@/utils/record";

const relations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    if (state.relations.term) {
      const term = state.relations.term.toLowerCase();

      return mapValue(state.relations.relations, (v) => {
        if (v.inwardIssue.toLowerCase().includes(term) || v.outwardIssue.toLowerCase().includes(term)) {
          return v;
        }
        return;
      });
    } else {
      return state.relations.relations;
    }
  },
);

interface Result {
  issues: Record<IssueKey, IssueModel>;
  relations: RelationModel[];
  relationRecord: Record<IssueRelationId, RelationModel>;
}

/**
 * get relations for issue
 */
export const useGetRelations = function useGetRelations(): Result {
  const relationRecord = useAppSelector(relations);
  const issueRecord = useAppSelector(selectCurrentIssueRecord);
  const entries = mapValue(relationRecord, (relation): RelationModel | undefined => {
    const inward = issueRecord[relation.inwardIssue];
    const outward = issueRecord[relation.outwardIssue];
    if (!inward || !outward) {
      return undefined;
    }

    return { relationId: relation.id, inward, outward };
  });

  return {
    issues: issueRecord,
    relationRecord: entries,
    relations: Object.values(entries),
  };
};
