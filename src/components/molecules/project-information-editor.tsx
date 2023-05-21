import { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { Button } from "../atoms/button";
import { Suggestor } from "./suggestor";
import { SuggestedItem } from "@/model/suggestion";

export interface Props extends BaseProps {
  suggestions?: SuggestedItem[];
  onSelectProject?: (event: string | undefined) => void;
}

const Styles = {
  form: classNames("flex", "pb-0", "pt-4", "pl-2", "pr-2", "pb-4", "items-center", "justify-center"),

  suggestor: {
    container: classNames(),
    main: classNames("w-60"),
    buttonGroup: {
      container: classNames("bg-white", "flex"),
      button: classNames(
        "group",
        "rounded",
        "mx-1",
        "p-2",
        "hover:shadow",
        "active:shadow-md",
        "transition-[shadow_border]",
        "border",
        "border-transparent",
        "hover:border-lightgray",
      ),
      submit: classNames(iconize({ type: "circle-check", color: "complement", group: "group" })),
      cancel: classNames(iconize({ type: "circle-x", color: "gray", group: "group" })),
    },
  },
};

// eslint-disable-next-line func-style
function ProjectSuggestor(props: {
  testid?: string;
  suggestions: SuggestedItem[];
  onSelect: (id: string) => void;
  currentKey: string | undefined;
}) {
  const gen = generateTestId(props.testid);
  const sprintTermElement = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const handleConfirmed = (value: string) => {
    setEditing(false);

    props.onSelect(value);
  };

  const handleOpenSuggestion = () => {
    setEditing(true);
  };

  const button = () => (
    <Button testid={gen("open-suggestion")} size="full" onClick={handleOpenSuggestion} schema={"gray"}>
      {props.currentKey || "Click to select project"}
    </Button>
  );

  return (
    <div ref={sprintTermElement} className={Styles.suggestor.main}>
      {!editing ? button() : null}
      {!editing ? null : (
        <Suggestor focusOnInit={true} suggestions={[]} testid={gen("suggestor")} onConfirmed={handleConfirmed} />
      )}
    </div>
  );
}

// eslint-disable-next-line func-style
export function ProjectInformationEditor({ onSelectProject, ...props }: Props) {
  const gen = generateTestId(props.testid);
  const suggestions = props.suggestions ?? [];

  const handleCancel = () => {
    if (onSelectProject) {
      onSelectProject(undefined);
    }
  };

  const handleSubmit = () => {};

  return (
    <form className={Styles.form} method="dialog" data-testid={gen("main")} onSubmit={handleSubmit}>
      <ProjectSuggestor suggestions={suggestions} currentKey={""} testid={gen("suggestor")} onSelect={() => {}} />
      <span className={Styles.suggestor.buttonGroup.container}>
        <button className={Styles.suggestor.buttonGroup.button} onClick={handleCancel} data-testid={gen("cancel")}>
          <span className={Styles.suggestor.buttonGroup.cancel} />
        </button>
        <button className={Styles.suggestor.buttonGroup.button} onClick={handleSubmit} data-testid={gen("submit")}>
          <span className={Styles.suggestor.buttonGroup.submit} />
        </button>
      </span>
    </form>
  );
}
