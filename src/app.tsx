import classNames from "classnames";
import { BaseProps } from "./components/helper";
import { IssueSearcher } from "./components/organisms/issue-searcher";
import { UserConfiguration } from "./components/organisms/user-configuration";
import { ZoomSlider } from "./components/organisms/zoom-slider";
import { SideToolbar } from "./components/containers/side-toolbar";
import { TopToolbar } from "./components/containers/top-toolbar";
import { IssueGraphContainer } from "./components/containers/issue-graph";

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
  return (
    <div className={Styles.root}>
      <div className={Styles.topToolbars}>
        <TopToolbar testid="top-toolbar" />
        <IssueSearcher testid="issue-searcher" />
        <div className="pointer-events-none"></div>
        <UserConfiguration testid="user-configuration" />
      </div>
      <ZoomSlider testid="zoom-slider" />
      <SideToolbar testid="side-toolbar" />
      <IssueGraphContainer testid="issue-graph" />
    </div>
  );
};
