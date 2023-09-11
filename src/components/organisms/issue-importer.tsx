import classNames from "classnames";
import { useState } from "react";
import { Button } from "../atoms/button";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { QueryInput } from "../molecules/query-input";
import { Issue as IssueComponent } from "../molecules/issue";
import { Panel } from "../molecules/panel";
import { Checkbox } from "../atoms/checkbox";
import { useImportIssues, useSearchIssues } from "@/hooks";
import { IssueModel } from "@/view-models/issue";
import { difference, intercect } from "@/utils/basic";
import { getTargetIssuePositionInSVG } from "@/drivers/issue-graph/issue";

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
  issueList: {
    root: classNames(
      "flex",
      "flex-col",
      "pt-3",
      "gap-y-3",
      "px-3",
      "border-t",
      "border-t-lightgray",
      "h-full",
      "overflow-y-auto",
    ),
    empty: classNames(
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
    checkableIssue: classNames("flex", "flex-row", "items-center"),
    allSelector: classNames(
      "flex",
      "flex-row",
      "items-center",
      "font-bold",
      "text-secondary2-400",
      "rounded",
      "bg-secondary2-200/20",
      "cursor-pointer",
    ),
  },

  paginator: {
    root: classNames(
      "flex-none",
      "flex",
      "flex-row",
      "px-3",
      "py-2",
      "flex-nowrap",
      "justify-between",
      "items-center",
      "border-t",
      "border-t-lightgray",
    ),
    pagingskeleton: classNames("animate-pulse", "flex", "h-4", "w-12", "bg-lightgray"),
    buttonSkeleton: classNames("animate-pulse", "bg-lightgray", "h-10", "w-20"),
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
    icons: classNames("flex"),
    forwardIcon: (disabled: boolean) =>
      classNames(iconize({ type: "chevron-right", color: "gray", group: "group", disabled })),
    backwardIcon: (disabled: boolean) =>
      classNames(iconize({ type: "chevron-left", color: "gray", group: "group", disabled })),
    pageDisplay: classNames("text-sm", "bg-complement-200/50", "text-secondary1-500", "px-2", "py-1", "rounded"),
  },
};

const AllIssueSelector = (props: {
  onChange: (value: boolean) => void;
  issuesInPage: IssueModel[];
  selectedIssues: string[];
}) => {
  const diffSet = difference(new Set(props.issuesInPage.map((v) => v.key)), new Set(props.selectedIssues));

  const checked = diffSet.size === 0;

  return (
    <li className={Styles.issueList.allSelector} onClick={() => props.onChange(!checked)}>
      <Checkbox checked={checked} onChange={props.onChange} /> Select all{" "}
    </li>
  );
};

const IssueList = (props: {
  issues: IssueModel[];
  selectedIssues: string[];
  loading: boolean;
  testid: string;
  onToggleMark: (key: string) => void;
  onToggleMulti: (keys: string[]) => void;
}) => {
  const gen = generateTestId(props.testid);
  const selectedIssueKeys = new Set(props.selectedIssues);
  const handleSelected = (value: boolean) => {
    const keys = new Set(props.issues.map((v) => v.key));
    const selected = new Set(props.selectedIssues);
    let diff: Set<string>;

    if (value) {
      diff = difference(keys, selected);
    } else {
      diff = intercect(selected, keys);
    }
    props.onToggleMulti(Array.from(diff));
  };

  if (props.loading) {
    return (
      <ul className={Styles.issueList.root}>
        <IssueComponent loading testid={gen("skeleton")} />
        <IssueComponent loading testid={gen("skeleton")} />
        <IssueComponent loading testid={gen("skeleton")} />
      </ul>
    );
  }

  if (props.issues.length === 0) {
    return (
      <ul className={Styles.issueList.root}>
        <div className={Styles.issueList.empty} data-testid={gen("empty")}>
          No issues. Please search with valid JQL first.
        </div>
      </ul>
    );
  }

  return (
    <ul className={Styles.issueList.root}>
      <AllIssueSelector onChange={handleSelected} issuesInPage={props.issues} selectedIssues={props.selectedIssues} />
      {props.issues.map((v) => (
        <ul key={v.key} className={Styles.issueList.checkableIssue}>
          <li>
            <Checkbox
              checked={selectedIssueKeys.has(v.key)}
              onChange={() => props.onToggleMark(v.key)}
              testid={gen(`check-${v.key}`)}
            />
          </li>
          <IssueComponent key={v.key} issue={v} testid={gen(`${v.key}`)} onClick={props.onToggleMark} />
        </ul>
      ))}
    </ul>
  );
};

const Paginator = (props: {
  page: number;
  currentPageDataCount: number;
  loading: boolean;
  onChangePage: (page: number) => void;
  onImport: () => void;
  testid: string;
  issueCount: number;
}) => {
  const gen = generateTestId(props.testid);

  if (props.loading) {
    return (
      <div className={Styles.paginator.root} data-testid={gen("root")}>
        <span className={Styles.paginator.pagingskeleton} data-testid={gen("skeleton")} />
        <span className={Styles.paginator.buttonSkeleton} data-testid={gen("skeleton")} />
      </div>
    );
  }

  const backwardDisabled = props.page === 1;
  const forwardDisabled = props.page !== 1 && props.currentPageDataCount === 0;
  const importDisabled = props.issueCount === 0;
  const importText = props.issueCount === 0 ? "Select issues" : `Import ${props.issueCount} issues`;

  return (
    <div className={Styles.paginator.root} data-testid={gen("root")}>
      <div className={Styles.paginator.icons}>
        <button
          className={Styles.paginator.pagingButton(backwardDisabled)}
          disabled={backwardDisabled}
          aria-disabled={backwardDisabled}
          data-testid={gen("backward")}
          onClick={() => props.onChangePage(props.page - 1)}
        >
          <span className={Styles.paginator.backwardIcon(backwardDisabled)} />
        </button>
        <button
          className={Styles.paginator.pagingButton(forwardDisabled)}
          disabled={forwardDisabled}
          aria-disabled={forwardDisabled}
          data-testid={gen("forward")}
          onClick={() => props.onChangePage(props.page + 1)}
        >
          <span className={Styles.paginator.forwardIcon(forwardDisabled)} />
        </button>
      </div>
      <div className={Styles.paginator.pageDisplay} data-testid={gen("page")}>
        Page {props.page}
      </div>
      <div>
        <Button
          type="normal"
          testid={gen("import")}
          disabled={importDisabled}
          schema="secondary2"
          onClick={() => props.onImport()}
        >
          {importText}
        </Button>
      </div>
    </div>
  );
};

// eslint-disable-next-line func-style
export function IssueImporter({ opened, testid, onClose }: Props) {
  const gen = generateTestId(testid);
  const [page, setPage] = useState(1);
  const {
    state: { isLoading, error, data },
    search,
    paginate,
    reset,
  } = useSearchIssues();
  const importer = useImportIssues();

  const handleClick = () => {
    reset();
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
    setPage(page);
  };

  const handleToggleMark = (key: string) => {
    importer.toggle(key);
  };

  const handleImport = () => {
    importer.execute();
  };

  const loading = isLoading && error === undefined;

  return (
    <Panel title="Import Issues" opened={opened} onClose={handleClick} testid={testid}>
      <QueryInput testid={gen("query-input")} loading={loading} error={error} onSearch={handleSearch} />
      <IssueList
        selectedIssues={importer.selectedIssues}
        issues={data ?? []}
        loading={loading}
        testid={gen("issue-list")}
        onToggleMark={handleToggleMark}
        onToggleMulti={importer.toggleMulti}
      />
      <Paginator
        onChangePage={handleChangePage}
        onImport={handleImport}
        page={page}
        currentPageDataCount={(data ?? [])?.length}
        loading={loading || importer.isLoading}
        testid={gen("paginator")}
        issueCount={importer.selectedIssues.length}
      />
    </Panel>
  );
}
