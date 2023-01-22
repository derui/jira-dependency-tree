import classNames from "classnames";
import { Button } from "../atoms/button";
import { Icon } from "../atoms/icon";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { RelationEditor } from "../organisms/relation-editor";
import { getRelationEditorOpened, selectSelectedIssueKey } from "@/state/selectors/relation-editor";
import { deselectIssueInGraph } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  root: (opened: boolean) => {
    const base = classes(
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
    );

    return {
      ...base,
      "w-0": !opened,
      "w-80": opened,
    };
  },
  header: classes(
    "w-full",
    "h-16",
    "pr-2",
    "relative",
    "flex-none",
    "flex",
    "flex-row",
    "items-center",
    "justify-center",
    "text-secondary1-500",
    "bg-secondary2-200",
  ),
  headerText: classes("text-xl", "border-b-2", "border-2-secondary1-100", "h-full", "items-center", "flex"),
  headerKey: classes("text-base"),
  headerButtonContainer: classes("absolute", "top-3", "right-2"),
  main: classes("flex-auto", "overflow-hidden"),
};

export const RelationEditorPanel: React.FC<Props> = (props) => {
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
            <Icon type='x' size='s' color='gray'></Icon>
          </Button>
        </span>
      </header>
      <main className={classNames(Styles.main)}>
        <RelationEditor kind='inward' testid={gen("inward-editor")} />
        <RelationEditor kind='outward' testid={gen("outward-editor")} />
      </main>
    </div>
  );
};
