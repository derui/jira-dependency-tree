import classNames from "classnames";
import { useCallback, useState } from "react";
import { produce } from "immer";
import { BaseProps, generateTestId } from "../helper";
import { RelationArrow } from "../molecules/relation-arrow";
import { IssueSelect } from "../molecules/issue-select";
import { IconButton } from "../atoms/icon-button";
import { Check, X } from "../atoms/icons";
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
  buttonContainer: classNames("flex", "flex-auto", "items-center", "justify-end", "mt-2", "w-full"),
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
      <IssueSelect key="inward" issues={issues} onSelect={handleInwardSelect} testid={gen("inward")} />
      <RelationArrow draft />
      <IssueSelect key="outward" issues={issues} onSelect={handleOutwardSelect} testid={gen("outward")} />
      <li className={Styles.buttonContainer}>
        <IconButton size="s" color="complement" onClick={handleSubmit} disabled={disabled}>
          <Check size="s" color="complement" />
        </IconButton>
        <IconButton color="gray" size="s" onClick={handleCancel}>
          <X size="s" />
        </IconButton>
      </li>
    </ul>
  );
}
