import React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import classNames from "classnames";
import { BaseProps } from "./components/helper";
import { IssueSearcher } from "./components/organisms/issue-searcher";
import { UserConfiguration } from "./components/organisms/user-configuration";
import { ZoomSlider } from "./components/molecules/zoom-slider";
import { SideToolbar } from "./components/containers/side-toolbar";
import { TopToolbar } from "./components/containers/top-toolbar";
import { useZoom } from "./hooks/zoom";
import { IssueGraphContainer } from "./components/containers/issue-graph";
import { useFocusedIssue } from "./hooks/focused-issue";

export type Props = BaseProps;

const Styles = {
  root: classNames("w-full", "h-full", "absolute"),
  topToolbars: classNames(
    "absolute",
    "grid",
    "grid-cols-top-toolbar",
    "grid-rows-1",
    "gap-3",
    "top-3",
    "px-3",
    "w-full",
    "z-10",
  ),
};

export const App: React.FC<Props> = () => {
  const zoom = useZoom();
  const focusedIssue = useFocusedIssue();

  return (
    <div className={Styles.root}>
      <div className={Styles.topToolbars}>
        <TopToolbar testid="top-toolbar" />
        <IssueSearcher testid="issue-searcher" />
        <div></div>
        <UserConfiguration testid="user-configuration" />
      </div>
      <ZoomSlider testid="zoom-slider" zoom={zoom} />
      <SideToolbar testid="side-toolbar" />
      <IssueGraphContainer testid="issue-graph" attension={focusedIssue} />
    </div>
  );
};
