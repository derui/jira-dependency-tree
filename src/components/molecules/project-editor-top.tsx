import type { MouseEvent } from "react";
import classNames from "classnames";
import { iconize } from "../atoms/iconize";
import { BaseProps, generateTestId } from "../helper";

export interface Props extends BaseProps {
  onRequireEdit?: () => void;
  projectKey?: string;
  name?: string;
}

const Styles = {
  root: classNames(
    "group",
    "relative",
    "flex",
    "flex-auto",
    "h-12",
    "px-3",
    "items-center",
    "transition-all",
    "border-b",
    "border-b-transparent",
  ),
  marker: (show: boolean) =>
    classNames("flex", "w-2", "h-2", "left-2", "top-2", "absolute", {
      invisible: !show,
      visible: show,
    }),
  markerPing: classNames("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classNames("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
  name: (needEditing: boolean) =>
    classNames(
      "w-full",
      "overflow-hidden",
      "text-ellipsis",
      "flex-none",
      "font-bold",
      "border-b-1",
      "border-b-transparent",
      "transition-colors",
      "leading-6",
      "pl-2",
      {
        "text-secondary2-400": !needEditing,
        "hover:text-secondary2-400": !needEditing,
      },
      {
        "text-gray": needEditing,
        "hover:text-darkgray": needEditing,
      },
    ),
  editButton: {
    root: classNames(
      "flex",
      "items-center",
      "cursor-pointer",
      "border",
      "border-transparent",
      "invisible",
      "group-hover:visible",
      "hover:border-complement-300",
      "hover:shadow",
      "transition-[shadow_color]",
      "rounded",
      "p-1",
    ),
    icon: classNames(iconize({ color: "complement", type: "pencil" })),
  },
} as const;

// eslint-disable-next-line func-style
export function ProjectEditorTop({ onRequireEdit, name, projectKey: key, testid }: Props) {
  const gen = generateTestId(testid);

  const handleRequireEdit = (e: MouseEvent) => {
    if (onRequireEdit) {
      e.stopPropagation();
      e.preventDefault();
      onRequireEdit();
    }
  };

  const showMarker = Boolean(!key && !name);
  const formatted = key && name ? `${key} | ${name}` : null;

  return (
    <span className={Styles.root} data-testid={gen("root")}>
      <span className={Styles.marker(showMarker)} aria-hidden={!showMarker} data-testid={gen("marker")}>
        <span className={Styles.markerPing}></span>
        <span className={Styles.markerInner}></span>
      </span>
      <span className={Styles.name(showMarker)} data-testid={gen("name")}>
        {formatted ?? "Select project"}
      </span>
      <span className={Styles.editButton.root} onClick={handleRequireEdit} data-testid={gen("editButton")}>
        <span className={Styles.editButton.icon} />
      </span>
    </span>
  );
}
