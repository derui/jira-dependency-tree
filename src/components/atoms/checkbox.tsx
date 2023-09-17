import classNames from "classnames";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { Square, SquareCheck } from "./icons";

export interface Props extends BaseProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

const Styles = {
  wrapper: (disabled: boolean) =>
    classNames("flex-none", "m-2", {
      "cursor-not-allowed": disabled,
      "cursor-pointer": !disabled,
    }),
  input: classNames("hidden"),
};

// eslint-disable-next-line func-style
export function Checkbox(props: Props) {
  const gen = generateTestId(props.testid);
  const ref = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(props.checked ?? false);

  useEffect(() => {
    if (props.checked !== undefined) {
      setChecked(props.checked);
    }
  }, [props.checked]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);

    if (props.onChange) {
      props.onChange(e.target.checked);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    ref.current?.click();
  };

  const icon = checked ? <SquareCheck /> : <Square />;

  return (
    <span
      className={Styles.wrapper(props.disabled ?? false)}
      aria-disabled={props.disabled ?? false}
      aria-selected={checked}
      onClick={handleClick}
      data-testid={gen("root")}
    >
      {icon}
      <input
        ref={ref}
        className={Styles.input}
        type="checkbox"
        disabled={props.disabled ?? false}
        aria-disabled={props.disabled ?? false}
        checked={checked}
        onChange={handleChange}
        data-testid={gen("checkbox")}
      />
    </span>
  );
}
