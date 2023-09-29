import classNames from "classnames";
import { useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { Check, X } from "../atoms/icons";
import { Input } from "../atoms/input";

export interface Props extends BaseProps {
  name: string;
  onRename?: (from: string, to: string) => void;
  onCancel?: () => void;
}

const Styles = {
  root: classNames("relative", "bg-white", "flex", "items-center", "overflow-hidden", "transition-shadow"),
  form: classNames("flex", "flex-auto", "items-center"),
  input: classNames("flex-auto"),
  name: classNames("flex-auto", "hover:underline", "cursor-pointer"),
  operationContainer: () => classNames("flex", "items-center", "bg-white", "py-2", "px-1"),
} as const;

// eslint-disable-next-line func-style
export function IssueSetEditor(props: Props) {
  const { name, onRename, onCancel, testid } = props;
  const gen = generateTestId(testid);
  const [value, setValue] = useState(name);

  const handleSubmit = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();

    onRename?.(name, value);
  };

  const handleCancel = () => onCancel?.();

  return (
    <li className={Styles.root}>
      <form className={Styles.form} method="dialog" onSubmit={handleSubmit}>
        <div className={Styles.input}>
          <Input value={value} onInput={setValue} testid={gen("input")} />
        </div>
        <div className={Styles.operationContainer()} data-testid={gen("confirmation")}>
          <IconButton color="secondary2" size="s" type="submit" testid={gen("submit")}>
            <Check color="secondary2" />
          </IconButton>
          <IconButton color="primary" size="s" onClick={handleCancel} testid={gen("cancel")}>
            <X color="primary" />
          </IconButton>
        </div>
      </form>
    </li>
  );
}
