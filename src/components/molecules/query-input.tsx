import React, { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { Loader_2, Search } from "../atoms/icons";

export interface Props extends BaseProps {
  loading?: boolean;
  error?: string;
  onSearch?: (query: string) => void;
  incremental?: boolean;
}

const Styles = {
  root: () => {
    return classNames("flex", "flex-row", "gap-x-2", "px-4", "py-2", "relative");
  },
  icon: (loading?: boolean) => {
    const animation = loading ? "animate-spin" : "";

    return classNames("flex", "items-center", animation);
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
    "animate-fade-in",
  ),
};

const Error = ({ error, loading, testid }: { error?: string; loading?: boolean; testid: string }) => {
  if (!error || loading) {
    return null;
  }

  return (
    <span className={Styles.error} data-testid={testid}>
      {error}
    </span>
  );
};

// eslint-disable-next-line func-style
export function QueryInput(props: Props) {
  const gen = generateTestId(props.testid);
  const { loading, error, onSearch } = props;
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSearch?.(query);
  };

  const handleInput = (value: string) => {
    setQuery(value);

    if (props.incremental) {
      onSearch?.(value);
    }
  };

  const icon = loading ? <Loader_2 /> : <Search />;
  const button = props.incremental ? null : (
    <Button schema="secondary2" type="submit" size="s" disabled={loading} testid={gen("button")}>
      <span className={Styles.icon(loading)}>{icon}</span>
    </Button>
  );

  return (
    <form className={Styles.root()} onSubmit={handleSubmit} data-testid={gen("root")}>
      <div className={Styles.inputWrapper}>
        <Input onInput={handleInput} value={query} placeholder="Input JQL" testid={gen("input")} />
        <Error error={error} loading={loading} testid={gen("error")} />
      </div>
      {button}
    </form>
  );
}
