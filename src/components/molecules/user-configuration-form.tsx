import React, { useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { filterEmptyString } from "@/util/basic";

type Payload = { userDomain: string; jiraToken: string; email: string };

export interface Props extends BaseProps {
  initialPayload?: Payload;
  onEndEdit: (event: Payload | undefined) => void;
}

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "pt-4"),
  main: classes("pb-4", "flex", "flex-col"),
  footer: classes("flex", "flex-auto", "flex-row", "justify-between", "p-3", "border-t-1", "border-t-lightgray"),
};

const canSubmit = (obj: Partial<Payload>) => {
  return filterEmptyString(obj.email) && filterEmptyString(obj.jiraToken) && filterEmptyString(obj.userDomain);
};

export const UserConfigurationForm: React.FC<Props> = ({ initialPayload, onEndEdit, ...props }) => {
  const gen = generateTestId(props.testid);
  const [obj, setObj] = useState({ ...initialPayload });
  const allowSubmit = canSubmit(obj);

  const update = (key: keyof typeof obj) => {
    return (v: string) => {
      setObj({ ...obj, [key]: v });
    };
  };

  const handleCancel = () => {
    onEndEdit(undefined);
  };

  const handleSubmit = () => {
    if (filterEmptyString(obj.email) && filterEmptyString(obj.jiraToken) && filterEmptyString(obj.userDomain)) {
      onEndEdit({
        email: obj.email,
        jiraToken: obj.jiraToken,
        userDomain: obj.userDomain,
      });
    }
  };

  return (
    <form className={classNames(Styles.form)} method='dialog' data-testid={gen("dialog")} onSubmit={handleSubmit}>
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
          value={obj.jiraToken ?? ""}
          label='Credential'
          testid={gen("jira-token")}
          onInput={update("jiraToken")}
        />
      </div>
      <div className={classNames(Styles.footer)}>
        <Button testid={gen("cancel")} schema='gray' onClick={handleCancel}>
          Cancel
        </Button>
        <Button testid={gen("submit")} schema='primary' type='submit' disabled={!allowSubmit} onClick={() => {}}>
          Apply
        </Button>
      </div>
    </form>
  );
};
