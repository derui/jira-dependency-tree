import { useEffect, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { Search, X } from "../atoms/icons";

export interface Props extends BaseProps {
  loading?: boolean;
  onSearch?: (term: string) => void;
  onCancel?: () => void;
}

type Status = "Searching" | "Prepared" | "BeforePrepared";

const Styles = {
  input: (status: Status) =>
    classNames("flex-1", "flex", "flex-row", "overflow-hidden", "transition-width", {
      "w-72": status === "Searching",
      "w-0": status !== "Searching",
      "animate-hidden": status !== "Searching",
    }),

  term: () => classNames("outline-none", "w-full", "pl-2"),
  searcher: classNames("h-12", "flex", "items-center", "justify-center", "max-w-fit"),
  searchButtonWrapepr: () => classNames("items-center", "justify-center", "flex"),
};

// eslint-disable-next-line func-style
export function SearchInput(props: Props) {
  const { loading } = props;
  const gen = generateTestId(props.testid);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<Status>("BeforePrepared");

  useEffect(() => {
    if (!loading) {
      setStatus("Prepared");
    }
  }, [loading]);

  const handleTermInputted = (term: string) => {
    if (status === "Searching") {
      setTerm(term);
      if (props.onSearch) {
        props.onSearch(term);
      }
    }
  };

  const handleOpenerClicked = () => {
    if (status !== "BeforePrepared") {
      setStatus("Searching");
    }
  };

  const handleCancelClicked = () => {
    setStatus("Prepared");
    setTerm("");
    if (props.onCancel) {
      props.onCancel();
    }
  };

  return (
    <div className={Styles.searcher}>
      <div className={Styles.searchButtonWrapepr()}>
        <IconButton
          color={status === "Searching" ? "secondary2" : "gray"}
          size="s"
          testid={gen("opener")}
          disabled={status === "BeforePrepared"}
          onClick={handleOpenerClicked}
        >
          <Search color={status === "Searching" ? "secondary2" : "gray"} size="s" />
        </IconButton>
      </div>
      <div className={Styles.input(status)} aria-hidden={status !== "Searching"} data-testid={gen("input-wrapper")}>
        <input
          className={Styles.term()}
          type="text"
          placeholder="Search Term"
          value={term}
          onChange={(e) => handleTermInputted(e.target.value)}
          data-testid={gen("input")}
        />
        <IconButton color={term ? "primary" : "gray"} size="s" onClick={handleCancelClicked} testid={gen("cancel")}>
          <X color={term ? "primary" : "gray"} size="s" />
        </IconButton>
      </div>
    </div>
  );
}
