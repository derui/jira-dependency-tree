import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Button } from "../atoms/button";
import { SyncIssueButton } from "../organisms/sync-issue-button";
import { IssueImporter } from "../organisms/issue-importer";
import { iconize } from "../atoms/iconize";
import { RelationEditor } from "../organisms/relation-editor";

export type Props = BaseProps;

const Styles = {
  root: classNames(
    "relative",
    "bg-white",
    "shadow-md",
    "gap-2",
    "grid",
    "grid-cols-project-toolbar",
    "transition-height",
  ),
  importerOpenerIcon: classNames(iconize({ type: "transfer-in", size: "m", color: "complement" })),
  relationEditorOpenerIcon: classNames(iconize({ type: "binary-tree", size: "m", color: "complement" })),
};

type Opened = "none" | "importer" | "relation-editor";

// eslint-disable-next-line func-style
export function TopToolbar(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState<Opened>("none");

  return (
    <div className={Styles.root}>
      <Button
        schema="primary"
        disabled={opened !== "none"}
        testid={gen("importer-opener")}
        onClick={() => setOpened("importer")}
      >
        <span className={Styles.importerOpenerIcon} />
        Open importer
      </Button>
      <Button
        schema="primary"
        disabled={opened !== "none"}
        testid={gen("relation-editor-opener")}
        onClick={() => setOpened("relation-editor")}
      >
        <span className={Styles.importerOpenerIcon} />
        Open Relation Editor
      </Button>

      <SyncIssueButton testid="sync-issue-button" />
      <IssueImporter opened={opened === "importer"} testid={gen("importer")} onClose={() => setOpened("none")} />
      <RelationEditor opened={opened === "importer"} testid={gen("importer")} onClose={() => setOpened("none")} />
    </div>
  );
}
