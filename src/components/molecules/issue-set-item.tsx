import classNames from "classnames";
import { useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { Check, Pencil, Trash, X } from "../atoms/icons";

export interface Props extends BaseProps {
  name: string;
  onDelete?: () => void;
  onRenameRequested?: () => void;
  onSelect?: () => void;
}

type DeletingState = "deleting" | "pre";

const Styles = {
  root: classNames(
    "relative",
    "pt-2",
    "bg-white",
    "flex",
    "items-center",
    "overflow-hidden",
    "border",
    "rounded",
    "px-3",
    "py-2",
    "hover:shadow-lg",
    "transition-shadow",
  ),
  name: classNames("flex-auto", "hover:underline", "cursor-pointer"),
  operationContainer: (opened: boolean) =>
    classNames("flex", "flex-none", "gap-2", {
      visible: opened,
      invisible: !opened,
    }),
  deletingContainer: (opened: boolean) =>
    classNames(
      "absolute",
      "flex",
      "items-center",
      "bg-primary-200/20",
      "py-2",
      "px-1",
      "rounded-l",
      "z-10",
      "transition-[right]",
      "w-48",
      {
        "-right-48": !opened,
        "right-0": opened,
      },
    ),
  confirmation: classNames("text-primary-400", "text-sm", "mx-2"),
} as const;

// eslint-disable-next-line func-style
export function IssueSetItem(props: Props) {
  const { name, onDelete, onRenameRequested, onSelect, testid } = props;
  const gen = generateTestId(testid);
  const [deleting, setDeleting] = useState<DeletingState>("pre");

  const handleDeleting = () => {
    setDeleting("deleting");
  };
  const handleCancelDeleting = () => {
    setDeleting("pre");
  };
  const handleDelete = () => onDelete?.();
  const handleRenameRequested = () => onRenameRequested?.();
  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect?.();
  };

  return (
    <li className={Styles.root}>
      <div className={Styles.name} onClick={handleSelect} data-testid={gen("name")}>
        {name}
      </div>
      <div className={Styles.operationContainer(deleting != "deleting")}>
        <IconButton color="secondary2" size="s" onClick={handleRenameRequested} testid={gen("rename-requester")}>
          <Pencil color="secondary2" />
        </IconButton>
        <IconButton color="primary" size="s" onClick={handleDeleting} testid={gen("delete-requester")}>
          <Trash color="primary" />
        </IconButton>
      </div>
      <div
        className={Styles.deletingContainer(deleting == "deleting")}
        data-testid={gen("confirmation")}
        aria-disabled={deleting != "deleting"}
      >
        <span className={Styles.confirmation}>Can we delete?</span>
        <IconButton color="secondary2" size="s" onClick={handleDelete} testid={gen("delete-confirm")}>
          <Check color="secondary2" />
        </IconButton>
        <IconButton color="primary" size="s" onClick={handleCancelDeleting} testid={gen("delete-canceler")}>
          <X color="primary" />
        </IconButton>
      </div>
    </li>
  );
}
