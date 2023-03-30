import { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Icon } from "../atoms/icon";
import { Suggestor } from "../molecules/suggestor";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button } from "../atoms/button";
import { querySuggestion } from "@/state/selectors/suggestion";
import { SuggestionKind } from "@/type";
import { SuggestedItem } from "@/model/suggestion";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  requestSuggestion,
} from "@/state/actions";

const ConditionType = {
  Default: "default",
  Sprint: "sprint",
  Epic: "epic",
} as const;

type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export interface Props extends BaseProps {
  onClose: () => void;
}

const Styles = {
  searchConditionEditorContainer: classes("flex", "flex-col", "top-full", "bg-white", "w-full"),
  header: classes(
    "border-b-2",
    "border-b-secondary1-200",
    "text-secondary1-500",
    "text-lg",
    "font-bold",
    "p-3",
    "whitespace-nowrap",
  ),
  selection: classes("flex-auto", "p-2"),
  baseForm: classes("flex", "flex-row", "p-3", "items-center"),
  controlButton: classes("flex-none", "first:ml-0", "last:mr-0", "mx-1", "cursor-pointer"),
  sprintSuggestor: (opened: boolean) => {
    return {
      ...classes("p-2", "pt-0"),
      ...(!opened ? classes("hidden") : {}),
    };
  },
  epicInput: (opened: boolean) => {
    return {
      ...classes("p-2", "pt-0"),
      ...(!opened ? classes("hidden") : {}),
    };
  },
};

const SprintCondition = (props: Props, conditionType: ConditionType, onFinished: (cond: SuggestedItem) => void) => {
  const gen = generateTestId(props.testid);
  const sprintTermElement = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [, suggestions] = useAppSelector(querySuggestion(SuggestionKind.Sprint));
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedItem | undefined>(undefined);

  const dispatch = useAppDispatch();

  const handleConfirmed = (value: string) => {
    setEditing(false);

    const selected = suggestions?.find((v) => v.value === value);
    if (!selected) {
      return;
    }

    onFinished(selected);
    setSelectedSuggestion(selected);
  };

  const button = () => (
    <Button testid={gen("open-suggestion")} size='full' onClick={() => setEditing(true)} schema={"gray"}>
      {selectedSuggestion ? selectedSuggestion.displayName : "Click to select sprint"}
    </Button>
  );

  return (
    <div ref={sprintTermElement} className={classNames(Styles.sprintSuggestor(conditionType === ConditionType.Sprint))}>
      {!editing ? button() : null}
      {!editing ? null : (
        <Suggestor
          focusOnInit={true}
          suggestions={suggestions ?? []}
          testid={gen("suggested-sprint")}
          onConfirmed={handleConfirmed}
          onEmptySuggestion={(term) => dispatch(requestSuggestion({ kind: SuggestionKind.Sprint, term }))}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line func-style
export function ProjectSyncOptionEditorForm(props: Props) {
  const gen = generateTestId(props.testid);
  const [conditionType, setConditionType] = useState<ConditionType>(ConditionType.Default);
  const [epic, setEpic] = useState<string>("");
  const [sprint, setSprint] = useState<SuggestedItem | undefined>();
  const dispatch = useAppDispatch();

  const sprintCondition = SprintCondition(props, conditionType, (value) => {
    setSprint(value);
  });

  const handleCancel = () => {
    props.onClose();
  };

  const handleSubmit = () => {
    switch (conditionType) {
      case "default":
        dispatch(changeDefaultCondition());
        break;
      case "epic":
        dispatch(changeConditionToEpic(epic));
        break;
      case "sprint":
        if (sprint) {
          dispatch(changeConditionToSprint(sprint));
        }
        break;
    }

    props.onClose();
  };

  return (
    <div className={classNames(Styles.searchConditionEditorContainer)} data-testid={gen("selector")}>
      <h2 className={classNames(Styles.header)}>Select method to synchronize issues</h2>
      <div className={classNames(Styles.baseForm)}>
        <select
          className={classNames(Styles.selection)}
          data-testid={gen("condition-type")}
          onChange={(e) => setConditionType(e.target.value as ConditionType)}
        >
          <option value={ConditionType.Default}>Use Current Sprint</option>
          <option value={ConditionType.Sprint}>Select Sprint</option>
          <option value={ConditionType.Epic}>Select Epic</option>
        </select>
        <span
          role='button'
          className={classNames(Styles.controlButton)}
          data-testid={gen("cancel")}
          onClick={() => handleCancel()}
        >
          <Icon type='circle-x' color='gray' size='m' />
        </span>
        <span
          role='button'
          className={classNames(Styles.controlButton)}
          data-testid={gen("submit")}
          onClick={() => handleSubmit()}
        >
          <Icon type='circle-check' color='complement' size='m' />
        </span>
      </div>
      {sprintCondition}
      <div
        className={classNames(Styles.epicInput(conditionType === ConditionType.Epic))}
        aria-hidden={conditionType !== ConditionType.Epic}
        data-testid={gen("epic")}
      >
        <Input placeholder='e.g. TES-105' value='' testid={gen("epic-input")} onInput={setEpic} />
      </div>
    </div>
  );
}
