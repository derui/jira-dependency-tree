import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { LayoutDistributeHorizontal, LayoutDistributeVertical, Layout_2 } from "../atoms/icons";
import { IconButton } from "../atoms/icon-button";
import { GraphLayout } from "@/type";
import { useGraphLayout } from "@/hooks";

export type Props = BaseProps;

const Styles = {
  graphLayout: () =>
    classNames(
      "flex",
      "items-center",
      "justify-center",
      "relative",
      "flex-none",
      "bg-white",
      "cursor-pointer",
      "w-10",
      "h-10",
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
      "px-2",
      "py-1",
      opened ? ["opacity-100", "visible"] : [],
      !opened ? "invisible" : "",
    );
  },
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
      className={Styles.graphLayout()}
      data-testid={gen("graph-layout")}
      onClick={() => setOpened(!opened)}
      data-active={opened}
      data-layout={state}
    >
      <Layout_2 color={opened ? "secondary1" : "gray"} />
      <div className={Styles.graphLayouter(opened)} data-testid={gen("layouter")}>
        <IconButton color="secondary1" onClick={changeToHorizontal} testid={gen("horizontal-layouter")}>
          <LayoutDistributeHorizontal color={horizontalActive ? "secondary1" : "gray"} />
        </IconButton>
        <IconButton color="secondary1" onClick={changeToVertical} testid={gen("vertical-layouter")}>
          <LayoutDistributeVertical color={verticalActive ? "secondary1" : "gray"} />
        </IconButton>
      </div>
    </li>
  );
}
