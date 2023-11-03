import classNames from "classnames";
import { useEffect } from "react";
import { BaseProps } from "./components/helper";
import { UserConfiguration } from "./components/organisms/user-configuration";
import { ZoomSlider } from "./components/organisms/zoom-slider";
import { SideToolbar } from "./components/containers/side-toolbar";
import { TopToolbar } from "./components/containers/top-toolbar";
import { IssueGraphContainer } from "./components/containers/issue-graph";
import { useLoadIssue } from "./hooks/load-issue";

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

// eslint-disable-next-line func-style
export function App() {
  const loadIssue = useLoadIssue();

  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      const urlLike = e.clipboardData?.getData("text");
      if (!urlLike) {
        return;
      }

      loadIssue(urlLike);
    };

    document.body.addEventListener("paste", listener);

    return () => {
      document.body.removeEventListener("paste", listener);
    };
  }, [loadIssue]);

  return (
    <div className={Styles.root}>
      <div className={Styles.topToolbars}>
        <TopToolbar testid="top-toolbar" />
        <div className="pointer-events-none"></div>
        <UserConfiguration testid="user-configuration" />
      </div>
      <ZoomSlider testid="zoom-slider" />
      <SideToolbar testid="side-toolbar" />
      <IssueGraphContainer testid="issue-graph" />
    </div>
  );
}
