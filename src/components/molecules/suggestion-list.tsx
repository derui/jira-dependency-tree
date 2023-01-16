import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Dialog } from "../atoms/dialog";
import { SuggestedItem } from "@/model/suggestion";
import { Rect } from "@/util/basic";

export interface Props extends BaseProps {
  suggestions: SuggestedItem[];
  parentElement?: HTMLElement;
  suggestionIdSelected: string;
  onSelect?: (id: string) => void;
}

const Styles = {
  suggestorLabel: classes("flex", "flex-auto", "cursor-pointer", "items-center"),
  suggestions: classes("flex", "flex-col", "list-none"),
  suggestionNode: (selected: boolean) => {
    return {
      ...classes(
        "flex-none",
        "px-4",
        "py-3",
        "border-l-2",
        "border-l-transparent",
        "cursor-pointer",
        "hover:bg-secondary1-200",
      ),
      ...(selected ? classes("border-l-secondary1-300") : {}),
    };
  },
  suggestorMain: (opened: boolean) => {
    return {
      ...classes("flex-col", "top-full", "bg-white", "whitespace-nowrap", "text-base", "w-full"),
      ...(!opened ? classes("hidden") : classes("flex")),
    };
  },
  empty: classes("text-lightgray", "flex-none", "px-4", "py-3"),
};

export const Suggestor: React.FC<Props> = ({
  suggestions,
  parentElement,
  suggestionIdSelected,
  onSelect,
  ...props
}) => {
  const gen = generateTestId(props.testid);
  const opened = parentElement ? true : false;

  const suggestionNodes = suggestions.map((obj) => {
    return (
      <li
        key={obj.id}
        className={classNames(Styles.suggestionNode(obj.id === suggestionIdSelected))}
        data-testid={gen("suggestion")}
        data-id={obj.id}
        onClick={() => (onSelect ? onSelect(obj.id) : undefined)}
      >
        <span className={classNames(Styles.suggestorLabel)}>{obj.displayName}</span>
      </li>
    );
  });

  if (suggestionNodes.length === 0) {
    suggestionNodes.push(
      <li key='_empty' className={classNames(Styles.empty)} data-testid={gen("empty")}>
        No suggestions
      </li>,
    );
  }

  if (!parentElement) {
    return null;
  }

  return (
    <Dialog
      aligned='bottomLeft'
      opened={opened}
      margin='top'
      parentRect={Rect.fromDOMRect(parentElement.getBoundingClientRect())}
      testid={gen("root")}
    >
      <div className={classNames(Styles.suggestorMain(opened))} data-testid={gen("dialog")}>
        <ul className={classNames(Styles.suggestions)}>{suggestionNodes}</ul>
      </div>
    </Dialog>
  );
};
