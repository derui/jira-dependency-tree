import { FormEvent, useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { Button } from "../atoms/button";
import { Suggestor } from "./suggestor";
import { SuggestedItem } from "@/model/suggestion";

export interface Props extends BaseProps {
  suggestions?: SuggestedItem[];
  onSelectProject?: (event: string | null) => void;
  onCancel?: () => void;
}

const Styles = {
  form: classNames("flex", "pb-0", "pt-4", "pl-2", "pr-2", "pb-4", "items-center", "justify-center"),

  suggestor: {
    emptyLabel: classNames("text-gray"),
    main: classNames("w-60"),
    buttonGroup: {
      container: classNames("bg-white", "flex", "ml-2"),
      button: classNames(
        "group",
        "rounded",
        "p-2",
        "hover:shadow",
        "active:shadow-md",
        "transition-[shadow_border]",
        "border",
        "border-transparent",
        "hover:border-lightgray",
        "disabled:hover:border-transparent",
        "disabled:hover:shadow-none",
        "disabled:active:shadow-none",
      ),
      submit: (disabled: boolean) =>
        classNames(iconize({ type: "circle-check", color: "complement", group: "group", disabled })),
      cancel: classNames(iconize({ type: "circle-x", color: "gray", group: "group" })),
    },
  },
};

// eslint-disable-next-line func-style
function ProjectSuggestor(props: {
  testid?: string;
  suggestions: SuggestedItem[];
  onSelect: (id: string) => void;
  selectedId: string | null;
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

  const suggestion = props.suggestions.find((v) => v.id === props.selectedId);

  const button = () => (
    <Button testid={gen("open")} size="full" onClick={handleOpenSuggestion} schema={"gray"}>
      {suggestion?.displayName ?? "Click to select project"}
    </Button>
  );

  if (props.suggestions.length === 0) {
    return (
      <div className={Styles.suggestor.main}>
        <span className={Styles.suggestor.emptyLabel}>No project to select</span>
      </div>
    );
  }

  return (
    <div ref={sprintTermElement} className={Styles.suggestor.main}>
      {!editing ? button() : null}
      {!editing ? null : (
        <Suggestor
          focusOnInit={true}
          suggestions={props.suggestions}
          testid={gen("main")}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line func-style
export function ProjectInformationEditor({ onSelectProject, onCancel, ...props }: Props) {
  const gen = generateTestId(props.testid);
  const suggestions = props.suggestions ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (onSelectProject && selectedId) {
      onSelectProject(selectedId);
    }
  };
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };
  const disabled = suggestions.length === 0;

  return (
    <form className={Styles.form} method="dialog" data-testid={gen("main")} onSubmit={handleSubmit}>
      <ProjectSuggestor
        suggestions={suggestions}
        selectedId={selectedId}
        testid={gen("suggestor")}
        onSelect={handleSelect}
      />
      <span className={Styles.suggestor.buttonGroup.container}>
        <button className={Styles.suggestor.buttonGroup.button} onClick={handleCancel} data-testid={gen("cancel")}>
          <span className={Styles.suggestor.buttonGroup.cancel} />
        </button>
        <button
          className={Styles.suggestor.buttonGroup.button}
          disabled={disabled}
          aria-disabled={disabled}
          onClick={handleSubmit}
          data-testid={gen("submit")}
        >
          <span className={Styles.suggestor.buttonGroup.submit(disabled)} />
        </button>
      </span>
    </form>
  );
}
