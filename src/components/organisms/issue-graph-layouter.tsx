import { useState } from "react";
import classNames from "classnames";
import { Icon } from "../atoms/icon";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { GraphLayout } from "@/issue-graph/type";
import { getGraphLayout } from "@/state/selectors/graph-layout";
import { changeToHorizontalLayout, changeToVerticalLayout } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  graphLayout: classes("relative", "flex-none", "bg-white", "transition-colors", "cursor-pointer", "p-2"),
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
  iconButton: classes("flex-none", "bg-white", "p-2", "cursor-pointer", "rounded"),
};

// eslint-disable-next-line func-style
export function IssueGraphLayouter(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);
  const layout = useAppSelector(getGraphLayout());
  const dispatch = useAppDispatch();

  return (
    <li className={classNames(Styles.graphLayout)} data-testid={gen("graph-layout")} onClick={() => setOpened(!opened)}>
      <Icon type='layout-2' size='m' color='secondary1' active={opened} testid={gen("layout")}></Icon>
      <div className={classNames(Styles.graphLayouter(opened))} data-testid={gen("layouter")}>
        <span
          className={classNames(Styles.iconButton)}
          onClick={() => dispatch(changeToHorizontalLayout())}
          data-testid={gen("horizontal-layouter")}
        >
          <Icon
            type='layout-distribute-horizontal'
            size="m"
            color='secondary1'
            testid={gen("horizontal")}
            active={layout === GraphLayout.Horizontal}
          ></Icon>
        </span>
        <span
          className={classNames(Styles.iconButton)}
          onClick={() => dispatch(changeToVerticalLayout())}
          data-testid={gen("vertical-layouter")}
        >
          <Icon
            type='layout-distribute-vertical'
            size="m"
            color='secondary1'
            testid={gen("vertical")}
            active={layout === GraphLayout.Vertical}
          ></Icon>
        </span>
      </div>
    </li>
  );
}
