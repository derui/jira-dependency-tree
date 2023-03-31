import { useRef, useState } from "react";
import classNames from "classnames";
import { Dialog } from "../atoms/dialog";
import { BaseProps, generateTestId } from "../helper";
import { useAppSelector } from "../hooks";
import { ProjectSyncOptionEditorForm } from "../organisms/project-sync-option-editor-form";
import { SearchCondition } from "@/model/event";
import { isSearchConditionEditable, selectSearchCondition } from "@/state/selectors/project";
import { Rect } from "@/util/basic";

export type Props = BaseProps;

const Styles = {
  root: classNames("relative", "w-full", "flex", "items-center", "justify-center"),
  opener: (opened: boolean, disabled: boolean) => {
    return classNames(
      "inline-flex",
      "px-3",
      "py-1",
      "border",
      "rounded",
      "transition-colors",
      "cursor-pointer",
      "items-center",
      "whitespace-nowrap",
      "text-sm",
      {
        "text-white": opened,
        "bg-secondary1-200": opened,
        "border-secondary1-500": opened,
      },
      {
        "bg-white": !opened,
        "hover:text-white": !opened,
        "hover:bg-secondary1-200": !opened,
        "hover:border-secondary1-500": !opened,
      },
      {
        "text-lightgray": disabled,
        "border-lightgray": disabled,
      },
    );
  },
};

const currentConditionName = (condition: SearchCondition | undefined) => {
  if (condition?.epic) {
    return condition.epic;
  } else if (condition?.sprint) {
    return condition.sprint.displayName;
  }

  return "Current Sprint";
};

// eslint-disable-next-line func-style
export function ProjectSyncOptionEditor(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const searchCondition = useAppSelector(selectSearchCondition());
  const isEditable = useAppSelector(isSearchConditionEditable());
  const disabled = !isEditable;

  return (
    <div ref={ref} className={classNames(Styles.root)}>
      <button
        className={Styles.opener(opened, disabled)}
        disabled={disabled}
        data-testid={gen("opener")}
        onClick={() => {
          setOpened(!opened);
        }}
      >
        {currentConditionName(searchCondition)}
      </button>

      <Dialog
        testid={gen("form-dialog")}
        aligned='bottomLeft'
        margin='all'
        opened={opened}
        parentRect={ref.current ? Rect.fromDOMRect(ref.current.getBoundingClientRect()) : undefined}
      >
        <ProjectSyncOptionEditorForm onClose={() => setOpened(false)} testid={gen("form")} />
      </Dialog>
    </div>
  );
}
