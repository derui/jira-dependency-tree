import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { filterEmptyString } from "@/utils/basic";

type Payload = { userDomain: string; token: string; email: string };

export interface Props extends BaseProps {
  initialPayload?: Payload;
  onEndEdit: (event: Payload | undefined) => void;
}

const Styles = {
  form: classNames("flex", "flex-col", "pb-0", "pt-4"),
  main: classNames("pb-4", "flex", "flex-col"),
  footer: classNames("flex", "flex-auto", "flex-row", "justify-between", "p-3", "border-t-1", "border-t-lightgray"),
};

const canSubmit = (obj: Partial<Payload>) => {
  return filterEmptyString(obj.email) && filterEmptyString(obj.token) && filterEmptyString(obj.userDomain);
};

// eslint-disable-next-line func-style
export function UserConfigurationForm({ initialPayload, onEndEdit, ...props }: Props) {
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
    if (filterEmptyString(obj.email) && filterEmptyString(obj.token) && filterEmptyString(obj.userDomain)) {
      onEndEdit({
        email: obj.email,
        token: obj.token,
        userDomain: obj.userDomain,
      });
    }
  };

  return (
    <form className={Styles.form} method="dialog" data-testid={gen("dialog")} onSubmit={handleSubmit}>
      <div className={Styles.main}>
        <Input
          placeholder="e.g. your-domain"
          value={obj.userDomain ?? ""}
          label="User Domain"
          testid={gen("user-domain")}
          onInput={update("userDomain")}
        />
        <Input
          placeholder="e.g. your@example.com"
          value={obj.email ?? ""}
          label="Email"
          testid={gen("email")}
          onInput={update("email")}
        />
        <Input
          placeholder="required"
          value={obj.token ?? ""}
          label="Credential"
          testid={gen("token")}
          onInput={update("token")}
        />
      </div>
      <div className={Styles.footer}>
        <Button testid={gen("cancel")} schema="gray" onClick={handleCancel}>
          Cancel
        </Button>
        <Button testid={gen("submit")} schema="primary" type="submit" disabled={!allowSubmit} onClick={() => {}}>
          Apply
        </Button>
      </div>
    </form>
  );
}
