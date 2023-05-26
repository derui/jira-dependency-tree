import type { MouseEvent } from "react";
import classNames from "classnames";
import { iconize } from "../atoms/iconize";
import { BaseProps, generateTestId } from "../helper";

type ProjectTopState = "Loading" | "Editable";

export interface Props extends BaseProps {
  projectState?: ProjectTopState;
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
    root: (state: ProjectTopState) =>
      classNames(
        "flex",
        "items-center",
        "cursor-pointer",
        "border",
        "border-transparent",
        "transition-[shadow_color]",
        "rounded",
        "p-1",
        {
          invisible: state === "Editable",
          "hover:border-complement-300": state === "Editable",
          "hover:shadow": state === "Editable",
          "group-hover:visible": state === "Editable",
        },
      ),
    icon: classNames(iconize({ color: "complement", type: "pencil" })),
    loader: classNames(iconize({ color: "complement", type: "loader-2" }), "animate-spin"),
  },
} as const;

// eslint-disable-next-line func-style
export function ProjectEditorTop({ onRequireEdit, name, projectKey: key, testid, projectState = "Editable" }: Props) {
  const gen = generateTestId(testid);
  const showMarker = Boolean(!key && !name);
  const formatted = key && name ? `${key} | ${name}` : null;

  const handleRequireEdit = (e: MouseEvent) => {
    if (onRequireEdit) {
      e.stopPropagation();
      e.preventDefault();
      onRequireEdit();
    }
  };

  let Iconized = (
    <button
      className={Styles.editButton.root(projectState)}
      onClick={handleRequireEdit}
      data-testid={gen("editButton")}
    >
      <span className={Styles.editButton.icon} />
    </button>
  );
  if (projectState === "Loading") {
    Iconized = <span className={Styles.editButton.loader} data-testid={gen("loader")} />;
  }

  return (
    <span className={Styles.root} data-testid={gen("root")}>
      <span className={Styles.marker(showMarker)} aria-hidden={!showMarker} data-testid={gen("marker")}>
        <span className={Styles.markerPing}></span>
        <span className={Styles.markerInner}></span>
      </span>
      <span className={Styles.name(showMarker)} data-testid={gen("name")}>
        {formatted ?? "Select project"}
      </span>
      {Iconized}
    </span>
  );
}
