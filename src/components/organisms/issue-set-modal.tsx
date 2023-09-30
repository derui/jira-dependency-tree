import classNames from "classnames";
import { useState } from "react";
import { produce } from "immer";
import { BaseProps, generateTestId } from "../helper";
import { Modal } from "../atoms/modal";
import { IssueSetItem } from "../molecules/issue-set-item";
import { IconButton } from "../atoms/icon-button";
import { Plus } from "../atoms/icons";
import { IssueSetEditor } from "../molecules/issue-set-editor";
import { useIssueSet } from "@/hooks";

type Props = BaseProps;

const Styles = {
  opener: classNames(
    "flex",
    "items-center",
    "h-8",
    "px-2",
    "py-1",
    "whitespace-nowrap",
    "w-32",
    "overflow-hidden",
    "text-ellipsis",
  ),
  textLink: classNames("cursor-pointer", "hover:underline"),
  issueSetList: classNames("flex", "flex-auto", "flex-col", "gap-1", "px-3", "py-2", "h-full", "overflow-y-auto"),
  appender: classNames(
    "flex",
    "flex-row",
    "justify-end",
    "flex-none",
    "h-12",
    "px-3",
    "py-2",
    "items-center",
    "gap-2",
    "hover:",
  ),
} as const;

// eslint-disable-next-line func-style
function IssueSetCreator(props: { onCreate: (name: string) => "InvalidArgument" | "success" } & BaseProps) {
  const gen = generateTestId(props.testid);
  const [creating, setCreating] = useState(false);

  if (creating) {
    const handleCreate = (_: string, to: string) => {
      const ret = props.onCreate(to);
      if (ret === "success") {
        setCreating(false);
      }
    };
    return (
      <IssueSetEditor name="" onRename={handleCreate} onCancel={() => setCreating(false)} testid={gen("editor")} />
    );
  } else {
    return (
      <li className={Styles.appender}>
        <IconButton color="secondary1" onClick={() => setCreating(true)} testid={gen("button")}>
          <Plus />
        </IconButton>{" "}
      </li>
    );
  }
}

// eslint-disable-next-line func-style
export function IssueSetModal(props: Props) {
  const gen = generateTestId(props.testid);
  const issueSet = useIssueSet();
  const [opened, setOpened] = useState(false);
  const [renameRequested, setRenameRequested] = useState<string[]>([]);

  const name = issueSet.state.current.name;

  const handleOpenerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setOpened(true);
  };

  const handleClose = () => {
    setOpened(false);
  };

  const issueSets = issueSet.state.issueSets.map((v) => {
    const requested = renameRequested.includes(v);
    const deleteRequest = () =>
      setRenameRequested((state) => {
        return produce(state, (draft) => {
          delete draft[draft.indexOf(v)];
        });
      });

    if (requested) {
      const handleRename = (from: string, to: string) => {
        const ret = issueSet.rename(from, to);
        if (ret === "success") {
          deleteRequest();
        }
      };

      return (
        <IssueSetEditor
          key={v}
          name={v}
          onRename={handleRename}
          onCancel={() => deleteRequest()}
          testid={gen("renamer")}
        />
      );
    }

    return (
      <IssueSetItem
        selected={issueSet.state.current.name == v}
        name={v}
        key={v}
        onRenameRequested={() =>
          setRenameRequested((state) => {
            return state.concat([v]);
          })
        }
        onDelete={() => issueSet.delete(v)}
        onSelect={() => issueSet.select(v)}
        testid={gen("issue-set")}
      />
    );
  });

  return (
    <>
      <div className={Styles.opener} onClick={handleOpenerClick} data-testid={gen("opener")}>
        <span className={Styles.textLink}> {name}</span>
      </div>
      <Modal size="l" opened={opened} title="Issue set" onClose={handleClose} testid={gen("modal")}>
        <ul className={Styles.issueSetList}>
          {issueSets}
          <IssueSetCreator onCreate={issueSet.create} testid={gen("creator")} />
        </ul>
      </Modal>
    </>
  );
}
