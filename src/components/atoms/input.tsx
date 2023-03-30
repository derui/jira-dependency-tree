import { useEffect, useRef, useState } from "react";
import type React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";

export interface Props extends BaseProps {
  placeholder?: string;
  value: string;
  label?: string;
  focus?: boolean;
  onInput?: (value: string) => void;
  onKeypress?: (key: string) => void;
}

const Styles = {
  container: classes(
    "flex",
    "flex-auto",
    "items-center",
    "flex-row",
    "mx-3",
    "justify-between",
    "whitespace-nowrap",
    "mt-4",
    "first:mt-0",
  ),
  label: classes("flex-[1_1_40%]", "text-primary-500", "whitespace-nowrap"),
  input: classes(
    "w-full",
    "flex-[1_1_60%]",
    "px-4",
    "py-3",
    "border",
    "border-lightgray",
    "outline-1",
    "outline-lightgray",
    "bg-lightgray",
    "rounded",
    "transition-outline",
    "transition-colors",
    "focus:bg-white",
    "focus:outline-primary-400",
    "focus:border-primary-400",
  ),
};

// eslint-disable-next-line func-style
export function Input({ placeholder, label, focus, onInput, onKeypress, ...props }: Props) {
  const gen = generateTestId(props.testid);

  const [value, setValue] = useState(props.value);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);

    if (onInput) {
      onInput(e.target.value);
    }
  };
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (onKeypress) {
      onKeypress(e.key);
    }
  };

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, [focus]);

  const input = (
    <input
      ref={ref}
      className={classNames(Styles.input)}
      type='text'
      placeholder={placeholder}
      value={value}
      data-testid={props.testid ?? "input"}
      onChange={handleInput}
      onKeyUp={handleKeypress}
    />
  );

  if (label) {
    return (
      <label className={classNames(Styles.container)}>
        <span className={classNames(Styles.label)} data-testid={gen("label")}>
          {label}
        </span>
        {input}
      </label>
    );
  } else {
    return input;
  }
}
