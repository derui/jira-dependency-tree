import classNames from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BaseProps, generateTestId } from "@/components/helper";

export interface CompletionProps extends BaseProps {
  /**
   * labels for completion
   */
  readonly labels: ReadonlyArray<string>;

  /**
   * labels filtered by user input
   */
  readonly onFilterLabel: (labels: string[]) => void;

  readonly selectedLabel?: string;

  readonly focused?: boolean;
}

const Styles = {
  root: classNames("relative", "flex-auto", "overflow-hidden", "w-full"),
  selectedLabel: (selected: boolean) =>
    classNames(
      "absolute",
      "top-2",
      "left-4",
      "text-sm",
      "whitespace-nowrap",
      "overflow-hidden",
      "text-ellipsis",
      "w-10/12",
      {
        hidden: !selected,
      },
    ),
  input: classNames(
    "w-full",
    "flex-auto",
    "px-3",
    "py-2",
    "border-none",
    "outline-none",
    "text-sm",
    "rounded",
    "transition-outline",
    "transition-colors",
  ),
} as const;

// eslint-disable-next-line func-style
export function Completion(props: CompletionProps) {
  const gen = generateTestId(props.testid);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const displayLabel = useMemo<boolean>(() => {
    if (value) {
      return false;
    } else if (props.selectedLabel) {
      return true;
    }

    return false;
  }, [props.selectedLabel, value]);

  useEffect(() => {
    if (props.selectedLabel) {
      console.log("reset");
      setValue("");
    }
  }, [props.selectedLabel]);

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus();
    }
  }, [ref.current, props.focused]);

  const placeholder = props.selectedLabel ? "" : "Select";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onFilterLabel) {
      const regexp = new RegExp(`.*${e.target.value}.*`);
      const filtered = props.labels.filter((v) => v.match(regexp));

      props.onFilterLabel(filtered);
    }

    setValue(e.target.value);
  };

  return (
    <div className={Styles.root}>
      <div className={Styles.selectedLabel(displayLabel)} data-testid={gen("display")}>
        {props.selectedLabel}
      </div>
      <input
        ref={ref}
        placeholder={placeholder}
        className={Styles.input}
        type="text"
        value={value}
        onChange={handleChange}
        data-testid={gen("input")}
      />
    </div>
  );
}
