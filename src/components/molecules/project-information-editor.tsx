import React, { useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Input } from "../atoms/input";
import { Icon } from "../atoms/icon";
import { filterEmptyString } from "@/util/basic";

type Payload = { projectKey: string };

export interface Props extends BaseProps {
  initialPayload?: Payload;
  onEndEdit: (event: Payload | undefined) => void;
}

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "pt-4", "pl-2", "pr-2", "pb-4"),

  // editor styles
  keyEditorButtonGroup: classes("bg-white", "flex", "justify-end", "mt-2"),
  keyEditorButton: classes("first:ml-0", "last:mr-0", "mx-2", "cursor-pointer"),
};

const canSubmit = (obj: Partial<Payload>) => {
  return filterEmptyString(obj.projectKey);
};

export const ProjectInformationEditor: React.FC<Props> = ({ initialPayload, onEndEdit, ...props }) => {
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
    <form className={classNames(Styles.form)} method='dialog' data-testid={gen("main")} onSubmit={handleSubmit}>
      <Input
        focus={true}
        value={obj.projectKey || ""}
        placeholder='Project Key'
        testid={gen("key")}
        onInput={update("projectKey")}
      />
      <span className={classNames(Styles.keyEditorButtonGroup)}>
        <span
          role='button'
          className={classNames(Styles.keyEditorButton)}
          onClick={handleCancel}
          data-testid={gen("cancel")}
        >
          <Icon type='circle-x' color='gray' size='m' />
        </span>
        <span
          role='button'
          aria-disabled={!allowSubmit}
          className={classNames(Styles.keyEditorButton)}
          onClick={handleSubmit}
          data-testid={gen("submit")}
        >
          <Icon type='circle-check' size='m' color='complement' />
        </span>
      </span>
    </form>
  );
};
