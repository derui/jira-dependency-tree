import classNames from "classnames";
import { useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { BinaryTree, CloudSearch } from "../atoms/icons";
import { IssueImporter } from "../organisms/issue-importer";
import { RelationEditor } from "../organisms/relation-editor";
import { ListSearch } from "../atoms/icons/list-search";
import { IssueList } from "../organisms/issue-list";

export type Props = BaseProps;

const Styles = {
  root: classNames(
    "absolute",
    "flex",
    "flex-col",
    "left-4",
    "top-1/2",
    "-translate-y-1/2",
    "bg-white",
    "rounded",
    "list-none",
    "shadow-md",
    "z-10",
    "p-2",
    "gap-2",
  ),
  iconContainer: classNames("flex", "w-8", "h-8", "items-center", "first-of-type:"),
};

type Opened = "none" | "importer" | "relation-editor" | "issue-list";

// eslint-disable-next-line func-style
export function SideToolbar(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState<Opened>("none");

  return (
    <div className={Styles.root}>
      <div className={Styles.iconContainer}>
        <IconButton
          color="gray"
          disabled={opened !== "none"}
          onClick={() => setOpened("importer")}
          testid={gen("importer-opener")}
        >
          <CloudSearch color="gray" />
        </IconButton>
      </div>
      <div className={Styles.iconContainer}>
        <IconButton
          color="gray"
          disabled={opened !== "none"}
          onClick={() => setOpened("relation-editor")}
          testid={gen("relation-editor-opener")}
        >
          <BinaryTree color="gray" />
        </IconButton>
      </div>
      <div className={Styles.iconContainer}>
        <IconButton color="gray" disabled={opened !== "none"} onClick={() => setOpened("issue-list")} name="issue-list">
          <ListSearch color="gray" />
        </IconButton>
      </div>

      <IssueImporter opened={opened === "importer"} testid={gen("importer")} onClose={() => setOpened("none")} />
      <RelationEditor
        opened={opened === "relation-editor"}
        testid={gen("relation-editor")}
        onClose={() => setOpened("none")}
      />
      <IssueList opened={opened === "issue-list"} testid={gen("issue-list")} onClose={() => setOpened("none")} />
    </div>
  );
}
