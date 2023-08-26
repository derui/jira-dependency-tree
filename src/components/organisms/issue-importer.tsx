import classNames from "classnames";
import { useState } from "react";
import { Button } from "../atoms/button";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { QueryInput } from "../molecules/query-input";
import { Issue as IssueComponent } from "../molecules/issue";
import { useSearchIssues } from "@/hooks";
import { Issue } from "@/model/issue";

export interface Props extends BaseProps {
  opened?: boolean;
  onClose?: () => void;
}

const Styles = {
  root: (opened?: boolean) => {
    return classNames(
      "absolute",
      "top-0",
      "right-0",
      "bg-white",
      "z-10",
      "h-full",
      "shadow-lg",
      "transition-width",
      "flex",
      "flex-col",
      "grid-rows-3",
      "grid-cols-1",
      "overflow-hidden",
      {
        "w-0": !opened,
        "w-1/3": opened,
      },
    );
  },
  header: classNames(
    "w-full",
    "h-16",
    "px-2",
    "relative",
    "flex-none",
    "flex",
    "flex-row",
    "items-center",
    "text-secondary1-500",
    "justify-between",
    "border-b",
    "border-b-secondary2-400",
  ),
  headerText: classNames("text-xl", "h-full", "items-center", "flex"),
  headerKey: classNames("text-base"),
  headerButtonContainer: classNames("flex", "top-3", "right-2"),
  main: classNames("flex", "flex-col", "overflow-hidden", "h-full"),
  issueList: classNames("flex", "flex-col", "pt-3", "gap-y-3", "px-3", "border-t", "border-t-lightgray", "h-full"),
  emptyIssuesArea: classNames(
    "flex",
    "items-center",
    "mt-0",
    "m-3",
    "p-4",
    "rounded",
    "border",
    "border-complement-200",
    "text-secondary2-500",
  ),

  paginator: {
    root: classNames("flex-none", "flex", "flex-row", "px-3", "my-2", "flex-nowrap", "justify-between", "items-center"),
    skeleton: classNames("animate-pulse", "flex", "flex-col", "h-4", "w-full", "bg-lightgray"),
    pagingButton: (disabled: boolean) =>
      classNames(
        "group",
        "border-b",
        "border-b-transparent",
        "border-b-2",
        {
          "hover:border-b-gray": !disabled,
          "cursor-pointer": !disabled,
        },
        "transition",
        "transition-border",
      ),
    forwardIcon: (disabled: boolean) =>
      classNames(iconize({ type: "chevron-right", color: "gray", group: "group", disabled })),
    backwardIcon: (disabled: boolean) =>
      classNames(iconize({ type: "chevron-left", color: "gray", group: "group", disabled })),
  },
};

const IssueList = (props: { issues: Issue[]; loading: boolean; testid: string }) => {
  const gen = generateTestId(props.testid);
  if (props.loading) {
    return (
      <ul className={Styles.issueList}>
        <IssueComponent loading testid={gen("skeleton")} />
        <IssueComponent loading testid={gen("skeleton")} />
        <IssueComponent loading testid={gen("skeleton")} />
      </ul>
    );
  }

  if (props.issues.length === 0) {
    return (
      <ul className={Styles.issueList}>
        <div className={Styles.emptyIssuesArea} data-testid={gen("empty")}>
          No issues. Please search with valid JQL first.
        </div>
      </ul>
    );
  }

  return (
    <ul className={Styles.issueList}>
      {props.issues.map((v) => (
        <IssueComponent key={v.key} issue={v} testid={gen("issue")} />
      ))}
    </ul>
  );
};

const Paginator = (props: {
  page: number;
  disabled: boolean;
  loading: boolean;
  onChangePage: (page: number) => void;
  testid: string;
}) => {
  const gen = generateTestId(props.testid);

  if (props.loading) {
    return (
      <div className={Styles.paginator.root} data-testid={gen("root")}>
        <span className={Styles.paginator.skeleton} data-testid={gen("skeleton")} />
      </div>
    );
  }

  const backwardDisabled = props.page === 1 || props.disabled;

  return (
    <div className={Styles.paginator.root} data-testid={gen("root")}>
      <span
        className={Styles.paginator.pagingButton(backwardDisabled)}
        aria-disabled={backwardDisabled}
        data-testid={gen("backward")}
      >
        <span className={Styles.paginator.backwardIcon(backwardDisabled)} />
      </span>
      <span
        className={Styles.paginator.pagingButton(props.disabled)}
        aria-disabled={props.disabled}
        data-testid={gen("forward")}
      >
        <span className={Styles.paginator.forwardIcon(props.disabled)} />
      </span>
    </div>
  );
};

// eslint-disable-next-line func-style
export function IssueImporter({ opened, testid, onClose }: Props) {
  const gen = generateTestId(testid);
  const [page, setPage] = useState(1);
  const [{ isLoading, error, data }, search, paginate] = useSearchIssues();

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSearch = (v: string) => {
    search(v);
    setPage(1);
  };

  const handleChangePage = (page: number) => {
    paginate(page);
  };

  const loading = isLoading && error === undefined;

  return (
    <div className={classNames(Styles.root(opened))} aria-hidden={!opened} data-testid={gen("root")}>
      <header className={classNames(Styles.header)} data-testid={gen("header")}>
        <h4 className={classNames(Styles.headerText)}> Import Issues </h4>
        <span className={classNames(Styles.headerButtonContainer)}>
          <Button size="s" onClick={handleClick} testid={gen("close")} schema="gray">
            <span className={iconize({ type: "x", size: "s", color: "gray" })}></span>
          </Button>
        </span>
      </header>
      <main className={classNames(Styles.main)}>
        <QueryInput testid={gen("query-input")} loading={loading} error={error} onSearch={handleSearch} />
        <IssueList issues={data ?? []} loading={loading} testid={gen("issue-list")} />
        <Paginator
          onChangePage={handleChangePage}
          page={page}
          disabled={(data ?? [])?.length === 0}
          loading={loading}
          testid={gen("paginator")}
        />
      </main>
    </div>
  );
}