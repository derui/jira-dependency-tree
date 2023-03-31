import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { iconize } from "../atoms/iconize";
import { filterEmptyString } from "@/util/basic";

type Payload = { projectKey: string };

export interface Props extends BaseProps {
  initialPayload?: Payload;
  onEndEdit: (event: Payload | undefined) => void;
}

const Styles = {
  form: classNames("flex", "flex-col", "pb-0", "pt-4", "pl-2", "pr-2", "pb-4"),

  // editor styles
  keyEditorButtonGroup: classNames("bg-white", "flex", "justify-end", "mt-2"),
  keyEditorButtonCancel: classNames(
    "first:ml-0",
    "last:mr-0",
    "mx-2",
    "cursor-pointer",
    iconize({ type: "circle-x", color: "gray" }),
  ),
  keyEditorButtonSubmit: classNames(
    "first:ml-0",
    "last:mr-0",
    "mx-2",
    "cursor-pointer",
    iconize({ type: "circle-check", color: "complement" }),
  ),
};

const canSubmit = (obj: Partial<Payload>) => {
  return filterEmptyString(obj.projectKey);
};

// eslint-disable-next-line func-style
export function ProjectInformationEditor({ initialPayload, onEndEdit, ...props }: Props) {
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
    if (filterEmptyString(obj.projectKey)) {
      onEndEdit({ projectKey: obj.projectKey });
    }
  };

  return (
    <form className={Styles.form} method='dialog' data-testid={gen("main")} onSubmit={handleSubmit}>
      <Input
        focus={true}
        value={obj.projectKey || ""}
        placeholder='Project Key'
        testid={gen("key")}
        onInput={update("projectKey")}
      />
      <span className={Styles.keyEditorButtonGroup}>
        <span
          role='button'
          className={Styles.keyEditorButtonCancel}
          onClick={handleCancel}
          data-testid={gen("cancel")}
        ></span>
        <span
          role='button'
          aria-disabled={!allowSubmit}
          className={Styles.keyEditorButtonSubmit}
          onClick={handleSubmit}
          data-testid={gen("submit")}
        ></span>
      </span>
    </form>
  );
}
