import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { SyncIssueButton } from "../organisms/sync-issue-button";
import { IssueImporter } from "../organisms/issue-importer";
import { iconize } from "../atoms/iconize";
import { RelationEditor } from "../organisms/relation-editor";

export type Props = BaseProps;

const Styles = {
  root: classNames("flex", "flex-row", "bg-white", "shadow-md", "justify-center", "items-center", "px-2"),
  iconContainer: classNames("flex", "ml-2", "w-8", "h-8", "items-center", "first-of-type:"),
  importerOpenerIcon: (disabled: boolean) =>
    classNames(
      "inline-block",
      "cursor-pointer",
      iconize({ type: "transfer-in", size: "m", color: "complement", disabled }),
    ),
  relationEditorOpenerIcon: (disabled: boolean) =>
    classNames(
      "inline-block",
      "cursor-pointer",
      iconize({ type: "binary-tree", size: "m", color: "complement", disabled }),
    ),
};

type Opened = "none" | "importer" | "relation-editor";

// eslint-disable-next-line func-style
export function TopToolbar(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState<Opened>("none");

  return (
    <div className={Styles.root}>
      <div className={Styles.iconContainer}>
        <span
          className={Styles.importerOpenerIcon(opened !== "none")}
          aria-disabled={opened !== "none"}
          data-testid={gen("importer-opener")}
          onClick={() => setOpened("importer")}
        />
      </div>
      <div className={Styles.iconContainer}>
        <span
          className={Styles.relationEditorOpenerIcon(opened !== "none")}
          aria-disabled={opened !== "none"}
          data-testid={gen("relation-editor-opener")}
          onClick={() => setOpened("relation-editor")}
        />
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
