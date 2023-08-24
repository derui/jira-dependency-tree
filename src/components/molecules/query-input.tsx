import React, { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";

export interface Props extends BaseProps {
  loading?: boolean;
  error?: string;
  onSearch?: (query: string) => void;
}

const Styles = {
  root: () => {
    return classNames("flex", "flex-row", "gap-x-2", "px-4", "py-2", "relative");
  },
  icon: (loading?: boolean) => {
    const iconFor = loading
      ? iconize({ type: "loader-2", color: "secondary2", size: "s" })
      : iconize({ type: "search", color: "secondary2", size: "s" });

    const animation = loading ? "animate-spin" : "";

    return classNames(
      "rounded",
      "flex",
      "h-6",
      "w-6",
      "border",
      "border-transparent",
      "items-center",
      animation,
      iconFor,
    );
  },

  inputWrapper: classNames("relative", "w-full"),
  error: classNames(
    "absolute",
    "w-full",
    "px-4",
    "py-2",
    "left-0",
    "top-12",
    "rounded",
    "bg-primary-200",
    "text-primary-500",
  ),
};

const Error = ({ error, loading }: { error?: string; loading?: boolean }) => {
  if (!error || loading) {
    return null;
  }

  return <span className={Styles.error}>{error}</span>;
};

// eslint-disable-next-line func-style
export function QueryInput(props: Props) {
  const gen = generateTestId(props.testid);
  const { loading, error, onSearch } = props;
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(query);
    }
  };

  const handleInput = (value: string) => {
    setQuery(value);
  };

  return (
    <form className={Styles.root()} onSubmit={handleSubmit} data-testid={gen("root")}>
      <div className={Styles.inputWrapper}>
        <Input onInput={handleInput} value={query} placeholder="Input JQL" testid={gen("input")} />
        <Error error={error} loading={loading} />
      </div>
      <Button schema="secondary2" type="submit" size="s" disabled={loading} testid={gen("button")}>
        <span className={Styles.icon(loading)}></span>
      </Button>
    </form>
  );
}
