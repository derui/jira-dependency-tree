import classNames from "classnames";
import { useState } from "react";
import { Button } from "../atoms/button";
import { BaseProps, generateTestId } from "../helper";
import { RelationEditor } from "../organisms/relation-editor";
import { iconize } from "../atoms/iconize";

export type Props = BaseProps;

const Styles = {
  root: (opened: boolean) => {
    return classNames(
      "absolute",
      "top-0",
      "right-0",
      "bg-white",
      "z-10",
      "h-full",
      "shadow-lg",
      "transition-width",
      "flex",
      "flex-col",
      "grid-rows-3",
      "grid-cols-1",
      "overflow-hidden",
      {
        "w-0": !opened,
        "w-80": opened,
      },
    );
  },
  header: classNames(
    "w-full",
    "h-16",
    "px-2",
    "relative",
    "flex-none",
    "flex",
    "flex-row",
    "items-center",
    "text-secondary1-500",
    "justify-between",
    "border-b",
    "border-b-secondary2-400",
  ),
  headerText: classNames("text-xl", "h-full", "items-center", "flex"),
  headerKey: classNames("text-base"),
  headerButtonContainer: classNames("flex", "top-3", "right-2"),
  main: classNames("flex-auto", "overflow-hidden"),
};

// eslint-disable-next-line func-style
export function RelationEditorPanel(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);

  return (
    <div className={classNames(Styles.root(opened))} aria-hidden={!opened} data-testid={gen("root")}>
      <div className={classNames(Styles.header)} data-testid={gen("header")}>
        <span className={classNames(Styles.headerButtonContainer)}>
          <Button
            size="s"
            onClick={() => {
              setOpened(false);
            }}
            testid={gen("close")}
            schema="gray"
          >
            <span className={iconize({ type: "x", size: "s", color: "gray" })}></span>
          </Button>
        </span>
      </div>
      <main className={classNames(Styles.main)}>
        <RelationEditor testid={gen("editor")} />
      </main>
    </div>
  );
}
