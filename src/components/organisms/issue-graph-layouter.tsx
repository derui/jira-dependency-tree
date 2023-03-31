import { useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { iconize } from "../atoms/iconize";
import { GraphLayout } from "@/issue-graph/type";
import { getGraphLayout } from "@/state/selectors/graph-layout";
import { changeToHorizontalLayout, changeToVerticalLayout } from "@/state/actions";

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
    return {
      ...classes(
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
      ),
      ...(opened ? classes("opacity-100", "visible") : {}),
      ...(!opened ? classes("invisible") : {}),
    };
  },
  iconButton: (layout: GraphLayout) =>
    classNames(
      "flex-none",
      "bg-white",
      "p-2",
      "cursor-pointer",
      "rounded",
      {
        [iconize({
          type: "layout-distribute-horizontal",
          size: "m",
          color: "secondary1",
          active: layout === GraphLayout.Horizontal,
        })]: layout === GraphLayout.Horizontal,
      },
      {
        [iconize({
          type: "layout-distribute-vertical",
          size: "m",
          color: "secondary1",
          active: layout === GraphLayout.Vertical,
        })]: layout === GraphLayout.Vertical,
      },
    ),
};

// eslint-disable-next-line func-style
export function IssueGraphLayouter(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);
  const layout = useAppSelector(getGraphLayout());
  const dispatch = useAppDispatch();

  return (
    <li
      className={Styles.graphLayout(opened)}
      data-testid={gen("graph-layout")}
      onClick={() => setOpened(!opened)}
      data-active={opened}
    >
      <div className={classNames(Styles.graphLayouter(opened))} data-testid={gen("layouter")}>
        <span
          className={Styles.iconButton(layout)}
          onClick={() => dispatch(changeToHorizontalLayout())}
          data-testid={gen("horizontal-layouter")}
          data-active={layout === GraphLayout.Horizontal}
        ></span>
        <span
          className={Styles.iconButton(layout)}
          onClick={() => dispatch(changeToVerticalLayout())}
          data-testid={gen("vertical-layouter")}
          data-active={layout === GraphLayout.Vertical}
        ></span>
      </div>
    </li>
  );
}
