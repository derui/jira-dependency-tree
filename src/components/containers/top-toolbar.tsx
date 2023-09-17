import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { SyncIssueButton } from "../organisms/sync-issue-button";
import { IssueImporter } from "../organisms/issue-importer";
import { RelationEditor } from "../organisms/relation-editor";
import { BinaryTree, TransferIn } from "../atoms/icons";
import { IconButton } from "../atoms/icon-button";

export type Props = BaseProps;

const Styles = {
  root: classNames("flex", "flex-row", "bg-white", "shadow-md", "justify-center", "items-center", "px-2"),
  iconContainer: classNames("flex", "ml-2", "w-8", "h-8", "items-center", "first-of-type:"),
};

type Opened = "none" | "importer" | "relation-editor";

// eslint-disable-next-line func-style
export function TopToolbar(props: Props) {
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
          <TransferIn color="gray" />
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

      <SyncIssueButton testid="sync-issue-button" />
      <IssueImporter opened={opened === "importer"} testid={gen("importer")} onClose={() => setOpened("none")} />
      <RelationEditor
        opened={opened === "relation-editor"}
        testid={gen("relation-editor")}
        onClose={() => setOpened("none")}
      />
    </div>
  );
}
