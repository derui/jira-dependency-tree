import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { Square, SquareCheck } from "./icons";
import { IconButton } from "./icon-button";

export interface Props extends BaseProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

const Styles = {
  wrapper: classNames("flex-none"),
  input: classNames("hidden"),
};

// eslint-disable-next-line func-style
export function Checkbox(props: Props) {
  const gen = generateTestId(props.testid);
  const [checked, setChecked] = useState(props.checked ?? false);
  const onChange = props.onChange;

  useEffect(() => {
    setChecked(props.checked ?? false);
  }, [props.checked]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setChecked((v) => !v);
    onChange?.(!checked);
  };

  const icon = checked ? <SquareCheck /> : <Square />;

  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-disabled={props.disabled ?? false}
      onClick={handleClick}
      className={Styles.wrapper}
    >
      <IconButton color="gray" disabled={props.disabled} testid={gen("root")}>
        {icon}
      </IconButton>
    </span>
  );
}
