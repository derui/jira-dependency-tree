import classNames from "classnames";
import { useCallback, useState } from "react";
import { produce } from "immer";
import { BaseProps, generateTestId } from "../helper";
import { RelationArrow } from "../molecules/relation-arrow";
import { IssueSelect } from "../molecules/issue-select";
import { Button } from "../atoms/button";
import { iconize } from "../atoms/iconize";
import { IssueModel } from "@/view-models/issue";
import { IssueKey } from "@/type";
import { useCurrentIssues } from "@/hooks/current-issues";

export interface Props extends BaseProps {
  readonly onAppend?: (inward: IssueKey, outward: IssueKey) => void;
  readonly onCancel?: () => void;
}

const Styles = {
  root: classNames("relative", "flex", "flex-col", "items-center"),
  submit: classNames("flex-none", "mt-3"),
  cancelWrapper: classNames("absolute", "right-3", "top-3"),
  cancelButton: classNames("cursor-pointer", iconize({ type: "x", color: "primary" })),
};

// eslint-disable-next-line func-style
export function AppendingPreparation(props: Props) {
  const gen = generateTestId(props.testid);
  const [state, setState] = useState<{ inward?: IssueModel; outward?: IssueModel }>({});
  const { issues } = useCurrentIssues();

  const handleInwardSelect = useCallback((model: IssueModel) => {
    setState((state) => {
      return produce(state, (draft) => {
        draft.inward = model;
      });
    });
  }, []);

  const handleOutwardSelect = useCallback((model: IssueModel) => {
    setState((state) => {
      return produce(state, (draft) => {
        draft.outward = model;
      });
    });
  }, []);

  const handleSubmit = () => {
    if (props.onAppend && state.inward && state.outward) {
      props.onAppend(state.inward.key, state.outward.key);
    }
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const disabled = !state.inward || !state.outward;

  return (
    <ul className={Styles.root} data-testid={gen("root")}>
      <li className={Styles.cancelWrapper}>
        <span role="button" className={Styles.cancelButton} onClick={handleCancel} />
      </li>
      <IssueSelect key="inward" issues={issues} onSelect={handleInwardSelect} testid={gen("inward")} />
      <RelationArrow draft />
      <IssueSelect key="outward" issues={issues} onSelect={handleOutwardSelect} testid={gen("outward")} />
      <li className={Styles.submit}>
        <Button schema="secondary2" onClick={handleSubmit} disabled={disabled}>
          Submit
        </Button>
      </li>
    </ul>
  );
}
