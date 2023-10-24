import { createDraftSafeSelector } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";
import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "./_internal-hooks";
import { issueSet } from "@/status/actions";
import { RootState } from "@/status/store";
import { IssueSetModel, issueSetToIssueSetModel } from "@/view-models/issue-set";

type Hook = {
  /**
   * create issue set with name
   */
  create(name: string): "InvalidArgument" | "success";

  /**
   * delete issue set with name
   */
  delete(name: string): "NotFound" | "success";

  /**
   * rename `from` to `to`
   */
  rename(from: string, to: string): "NotFound" | "InvalidArgument" | "success";

  /**
   * select issue set
   */
  change(name: string): void;

  /**
   * select the issue set changed
   */
  select(): void;

  readonly state: {
    readonly changedIssueSetName: string;
    readonly currentIssueSetName: string;
    readonly issueSets: ReadonlyArray<string>;
  };
};

const selectNames = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    return Object.keys(state.issueSet.issueSets);
  },
);

const selectCurrentIssueSet = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    const issueSet = state.issueSet.issueSets[state.issueSet.currentIssueSetKey];
    return issueSetToIssueSetModel(issueSet);
  },
);

export const useIssueSet = function useIssueSet(): Hook {
  const dispatch = useAppDispatch();
  const names = useAppSelector(selectNames, deepEqual);
  const current = useAppSelector(selectCurrentIssueSet, deepEqual);
  const [selected, setSelected] = useState(current.name);

  const create = useCallback<Hook["create"]>(
    (name) => {
      const trimmed = name.trim();
      if (trimmed.length < 1 || names.includes(trimmed)) {
        return "InvalidArgument";
      }

      dispatch(issueSet.create(trimmed));
      return "success";
    },
    [names],
  );

  const delete_ = useCallback<Hook["delete"]>(
    (name) => {
      if (!names.includes(name)) {
        return "NotFound";
      }

      dispatch(issueSet.delete(name));
      return "success";
    },
    [names],
  );

  const rename = useCallback<Hook["rename"]>(
    (from, to) => {
      if (!names.includes(from)) {
        return "InvalidArgument";
      }

      const trimmed = to.trim();
      if (trimmed.length < 1 || names.includes(trimmed)) {
        return "InvalidArgument";
      }

      dispatch(issueSet.rename({ from, to: trimmed }));
      return "success";
    },
    [names],
  );

  const change = (name: string) => {
    setSelected(name);
  };

  const select = useCallback<Hook["select"]>(() => {
    dispatch(issueSet.select(selected));
  }, [selected]);

  return {
    create,
    delete: delete_,
    rename,
    change,
    select,
    state: {
      changedIssueSetName: selected,
      currentIssueSetName: current.name,
      issueSets: names,
    },
  };
};
