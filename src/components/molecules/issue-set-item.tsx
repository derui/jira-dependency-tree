import classNames from "classnames";
import { useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { Check, Pencil, Trash, X } from "../atoms/icons";

export interface Props extends BaseProps {
  name: string;
  selected?: boolean;
  onDelete?: () => void;
  onRenameRequested?: () => void;
  onSelect?: () => void;
}

type DeletingState = "deleting" | "pre";

const Styles = {
  root: classNames("relative", "flex", "flex-none", "items-center"),
  container: classNames(
    "relative",
    "bg-white",
    "flex",
    "h-12",
    "flex-auto",
    "items-center",
    "overflow-hidden",
    "border",
    "border-secondary1-400",
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
  selectedMarker: (selected: boolean) =>
    classNames("mr-3", "rounded-full", "w-3", "h-3", "border", "border-complement-200", "transition-colors", {
      "bg-white": !selected,
      "bg-complement-300": selected,
    }),
} as const;

// eslint-disable-next-line func-style
export function IssueSetItem(props: Props) {
  const { name, onDelete, onRenameRequested, onSelect, testid, selected = false } = props;
  const gen = generateTestId(testid);
  const [deleting, setDeleting] = useState<DeletingState>("pre");

  const handleDeleting = () => {
    setDeleting("deleting");
  };
  const handleCancelDeleting = () => {
    setDeleting("pre");
  };
  const handleDelete = () => {
    if (!selected) {
      onDelete?.();
    }
  };
  const handleRenameRequested = () => onRenameRequested?.();
  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selected) {
      onSelect?.();
    }
  };

  return (
    <li className={Styles.root} data-testid={gen("root")}>
      <div className={Styles.selectedMarker(selected)}></div>
      <div className={Styles.container}>
        <div className={Styles.name} onClick={handleSelect} data-testid={gen("name")}>
          {name}
        </div>
        <div className={Styles.operationContainer(deleting != "deleting")}>
          <IconButton color="secondary2" size="s" onClick={handleRenameRequested} testid={gen("rename-requester")}>
            <Pencil color="secondary2" />
          </IconButton>
          {!selected ? (
            <IconButton color="primary" size="s" onClick={handleDeleting} testid={gen("delete-requester")}>
              <Trash color="primary" />
            </IconButton>
          ) : null}
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
      </div>
    </li>
  );
}
