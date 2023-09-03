import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { GraphLayout } from "@/drivers/issue-graph/type";
import { useGraphLayout } from "@/hooks";

export type Props = BaseProps;

const Styles = {
  graphLayout: (opened: boolean) =>
    classNames(
      "relative",
      "flex-none",
      "bg-white",
      "transition-colors",
      "cursor-pointer",
      "p-2",
      "w-10",
      "h-10",
      iconize({ type: "layout-2", size: "m", color: "secondary1", active: opened }),
    ),
  graphLayouter: (opened: boolean) => {
    return classNames(
      "absolute",
      "flex",
      "flex-row",
      "left-16",
      "top-0",
      "bg-white",
      "rounded",
      "shadow-lg",
      "transition-opacity",
      "opacity-0",
      "px-1",
      opened ? ["opacity-100", "visible"] : [],
      !opened ? "invisible" : "",
    );
  },
  iconButton: (layout: GraphLayout, active: boolean) =>
    classNames(
      "flex-none",
      "bg-white",
      "m-2",
      "cursor-pointer",
      "rounded",
      {
        [iconize({
          type: "layout-distribute-horizontal",
          size: "m",
          color: "secondary1",
          active: active,
        })]: layout === GraphLayout.Horizontal,
      },
      {
        [iconize({
          type: "layout-distribute-vertical",
          size: "m",
          color: "secondary1",
          active: active,
        })]: layout === GraphLayout.Vertical,
      },
    ),
};

// eslint-disable-next-line func-style
export function IssueGraphLayouter(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);
  const { state, changeToVertical, changeToHorizontal } = useGraphLayout();

  const horizontalActive = state === GraphLayout.Horizontal;
  const verticalActive = state === GraphLayout.Vertical;

  return (
    <li
      className={Styles.graphLayout(opened)}
      data-testid={gen("graph-layout")}
      onClick={() => setOpened(!opened)}
      data-active={opened}
    >
      <div className={Styles.graphLayouter(opened)} data-testid={gen("layouter")}>
        <span
          className={Styles.iconButton(GraphLayout.Horizontal, horizontalActive)}
          onClick={changeToHorizontal}
          data-testid={gen("horizontal-layouter")}
          data-active={horizontalActive}
        ></span>
        <span
          className={Styles.iconButton(GraphLayout.Vertical, verticalActive)}
          onClick={changeToVertical}
          data-testid={gen("vertical-layouter")}
          data-active={verticalActive}
        ></span>
      </div>
    </li>
  );
}
