import React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import classNames from "classnames";
import { BaseProps, classes } from "./components/helper";
import { ProjectInformation } from "./components/organisms/project-information";
import { ProjectSyncOptionEditor } from "./components/containers/project-sync-option-editor";
import { SyncIssueButton } from "./components/organisms/sync-issue-button";
import { IssueSearcher } from "./components/organisms/issue-searcher";
import { UserConfiguration } from "./components/organisms/user-configuration";
import { ZoomSlider } from "./components/molecules/zoom-slider";
import { useAppSelector } from "./components/hooks";
import { SideToolbar } from "./components/organisms/side-toolbar";
import { getZoom } from "./state/selectors/zoom";
import { RelationEditorPanel } from "./components/containers/relation-editor-panel";

export type Props = BaseProps;

const Styles = {
  root: classes("w-full", "h-full", "absolute"),
  topToolbars: classes("absolute", "grid", "grid-cols-top-toolbar", "grid-rows-1", "top-3", "px-3", "w-full", "z-10"),
  projectToolbar: classes(
    "relative",
    "bg-white",
    "px-3",
    "shadow-md",
    "gap-2",
    "grid",
    "grid-cols-project-toolbar",
    "transition-height",
  ),
  divider: classes("w-0", "border-l", "border-lightgray", "m-2"),
};

export const App: React.FC<Props> = () => {
  const zoom = useAppSelector(getZoom());

  return (
    <div className={classNames(Styles.root)}>
      <div className={classNames(Styles.topToolbars)}>
        <div className={classNames(Styles.projectToolbar)}>
          <ProjectInformation testid="project-information" />
          <span className={classNames(Styles.divider)}></span>
          <ProjectSyncOptionEditor testid="project-sync-option-editor" />
          <SyncIssueButton testid="sync-issue-button" />
        </div>
        <div></div>
        <IssueSearcher testid="issue-searcher" />
        <UserConfiguration testid="user-configuration" />
      </div>
      <ZoomSlider testid="zoom-slider" zoom={zoom} />
      <SideToolbar testid="side-toolbar" />
      <RelationEditorPanel testid='relation-editor' />
    </div>
  );
};
