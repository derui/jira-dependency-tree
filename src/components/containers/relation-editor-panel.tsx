import classNames from "classnames";
import { Button } from "../atoms/button";
import { BaseProps, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { RelationEditor } from "../organisms/relation-editor";
import { iconize } from "../atoms/iconize";
import { getRelationEditorOpened, selectSelectedIssueKey } from "@/state/selectors/relation-editor";
import { deselectIssueInGraph } from "@/state/actions";

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
  const opened = useAppSelector(getRelationEditorOpened());
  const selectedKey = useAppSelector(selectSelectedIssueKey());
  const dispatch = useAppDispatch();

  return (
    <div className={classNames(Styles.root(opened))} aria-hidden={!opened} data-testid={gen("root")}>
      <header className={classNames(Styles.header)} data-testid={gen("header")}>
        <h4 className={classNames(Styles.headerText)}>
          Relations (<span className={classNames(Styles.headerKey)}>{selectedKey}</span>)
        </h4>
        <span className={classNames(Styles.headerButtonContainer)}>
          <Button size='s' onClick={() => dispatch(deselectIssueInGraph())} testid={gen("close")} schema='gray'>
            <span className={iconize({ type: "x", size: "s", color: "gray" })}></span>
          </Button>
        </span>
      </header>
      <main className={classNames(Styles.main)}>
        <RelationEditor kind='inward' testid={gen("inward-editor")} />
        <RelationEditor kind='outward' testid={gen("outward-editor")} />
      </main>
    </div>
  );
}
