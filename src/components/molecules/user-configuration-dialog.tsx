import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { BaseProps, classes, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { filterEmptyString, Rect } from "@/util/basic";

type Payload = { userDomain: string; token: string; email: string };

export interface Props extends BaseProps {
  initialPayload?: Payload;
  openedAt?: Rect;
  onEndEdit: (event: Payload | undefined) => void;
}

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "pt-4"),
  main: classes("pb-4", "flex", "flex-col"),
  footer: classes("flex", "flex-auto", "flex-row", "justify-between", "p-3", "border-t-1", "border-t-lightgray"),
  dialogContainer: (opened: boolean) => {
    return {
      ...classes(
        "bg-white",
        "absolute",
        "top-full",
        "right-0",
        "mt-2",
        "right-3",
        "rounded",
        "shadow-lg",
        "transition-width",
        "overflow-hidden",
      ),
      ...(!opened ? classes("w-0") : {}),
      ...(opened ? classes("w-96") : {}),
    };
  },
};

const canSubmit = (obj: Partial<Payload>) => {
  return filterEmptyString(obj.email) && filterEmptyString(obj.token) && filterEmptyString(obj.userDomain);
};

export const UserConfigurationDialog: React.FC<Props> = ({ initialPayload, openedAt, onEndEdit, ...props }) => {
  const gen = generateTestId(props.testid);
  const ref = useRef(document.createElement("div"));
  const [obj, setObj] = useState({ ...initialPayload });
  const opened = openedAt !== undefined;
  const top = openedAt ? `calc(${openedAt.top + openedAt.height}px)` : "";
  const allowSubmit = canSubmit(obj);

  useEffect(() => {
    document.querySelector("#modal-root")?.appendChild(ref.current);

    return () => {
      document.querySelector("#modal-root")?.removeChild(ref.current);
    };
  }, []);

  const update = (key: keyof typeof obj) => {
    return (v: string) => {
      setObj({ ...obj, [key]: v });
    };
  };

  const handleCancel = () => {
    onEndEdit(undefined);
  };

  const handleSubmit = () => {
    if (filterEmptyString(obj.email) && filterEmptyString(obj.token) && filterEmptyString(obj.userDomain)) {
      onEndEdit({
        email: obj.email,
        token: obj.token,
        userDomain: obj.userDomain,
      });
    }
  };

  const dialog = (
    <div className={classNames(Styles.dialogContainer(opened))} style={{ top }} data-testid={gen("dialog-container")}>
      <form className={classNames(Styles.form)} method='dialog' data-testid={gen("dialog")}>
        <div className={classNames(Styles.main)}>
          <Input
            placeholder='e.g. your-domain'
            value={obj.userDomain ?? ""}
            label='User Domain'
            testid={gen("user-domain")}
            onInput={update("userDomain")}
          />
          <Input
            placeholder='e.g. your@example.com'
            value={obj.email ?? ""}
            label='Email'
            testid={gen("email")}
            onInput={update("email")}
          />
          <Input
            placeholder='required'
            value={obj.token ?? ""}
            label='Credential'
            testid={gen("jira-token")}
            onInput={update("token")}
          />
        </div>
        <div className={classNames(Styles.footer)}>
          <Button testid={gen("cancel")} schema='gray' onClick={handleCancel}>
            Cancel
          </Button>
          <Button testid={gen("submit")} schema='primary' type='submit' disabled={!allowSubmit} onClick={handleSubmit}>
            Apply
          </Button>
        </div>
      </form>
    </div>
  );

  return createPortal(dialog, ref.current);
};
