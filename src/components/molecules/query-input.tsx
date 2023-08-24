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
    return classNames("flex", "flex-row", "border", "hover:border-complement-300", "px-4", "py-2", "relative");
  },
  icon: classNames(
    "rounded",
    "flex",
    "absolute",
    "h-5",
    "w-5",
    "border",
    "border-transparent",
    "hover:border-lightgray",
    "right-1",
    "top-1",
    "transition",
    "items-center",
    iconize({ type: "search", color: "primary", size: "s" }),
  ),
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
    <form onSubmit={handleSubmit} data-testid={gen("root")}>
      <Input onInput={handleInput} value={query} placeholder="Input JQL" testid={gen("input")} />
      <Button schema="primary" type="submit" size="s" disabled={loading} testid={gen("button")}>
        <span className={Styles.icon}></span>
      </Button>
    </form>
  );
}
