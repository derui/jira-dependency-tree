import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Button } from "../atoms/button";
import { SyncIssueButton } from "../organisms/sync-issue-button";
import { IssueImporter } from "../organisms/issue-importer";
import { iconize } from "../atoms/iconize";

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
  openerIcon: classNames(iconize({ type: "transfer-in", size: "m", color: "complement" })),
};

// eslint-disable-next-line func-style
export function ProjectToolbar(props: Props) {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);

  return (
    <div className={Styles.root}>
      <Button schema="primary" disabled={opened} testid={gen("opener")} onClick={() => setOpened(!opened)}>
        <span className={Styles.openerIcon} />
        Open importer
      </Button>

      <SyncIssueButton testid="sync-issue-button" />
      <IssueImporter opened={opened} testid={gen("importer")} onClose={() => setOpened(false)} />
    </div>
  );
}
