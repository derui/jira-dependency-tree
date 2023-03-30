import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Dialog } from "../atoms/dialog";
import { Input } from "../atoms/input";
import { SuggestedItem } from "@/model/suggestion";
import { Rect } from "@/util/basic";

export interface Props extends BaseProps {
  focusOnInit: boolean;
  placeholder?: string;
  suggestions: SuggestedItem[];
  onConfirmed?: (value: string) => void;
  onEmptySuggestion?: (term: string) => void;
}

const Styles = {
  root: classes("flex"),
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
      ...classes(
        "flex-col",
        "top-full",
        "bg-white",
        "whitespace-nowrap",
        "text-base",
        "w-full",
        "max-h-96",
        "overflow-y-auto",
      ),
      ...(!opened ? classes("hidden") : classes("flex")),
    };
  },
  empty: classes("text-lightgray", "flex-none", "px-4", "py-3"),
};

const filterSuggestions = (suggestions: SuggestedItem[], term: string) => {
  return suggestions.filter((suggestion) => suggestion.displayName.toLowerCase().includes(term.toLowerCase()));
};

const selectSuggestion = (current: string, suggestions: SuggestedItem[], key: "ArrowDown" | "ArrowUp") => {
  const currentSuggestion = suggestions.findIndex((v) => v.id === current);

  switch (key) {
    case "ArrowDown":
      if (currentSuggestion === -1) {
        return suggestions[0]?.id ?? "";
      } else {
        const index = Math.min(suggestions.length - 1, currentSuggestion + 1);

        return suggestions[index]?.id ?? current;
      }
    case "ArrowUp":
      if (currentSuggestion === -1) {
        return suggestions[suggestions.length - 1]?.id ?? "";
      } else {
        const index = Math.max(0, currentSuggestion - 1);

        return suggestions[index]?.id ?? current;
      }
  }
};

// eslint-disable-next-line func-style
export function Suggestor({ focusOnInit, onConfirmed, onEmptySuggestion, ...props }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [term, setTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(props.suggestions);
  const gen = generateTestId(props.testid);
  const ref = useRef<HTMLSpanElement | null>(null);
  const opened = ref.current && term !== "" ? true : false;

  useEffect(() => {
    setFilteredSuggestions(filterSuggestions(props.suggestions, term));
  }, [props.suggestions]);

  const handleClick = (value: string) => {
    setTerm("");
    setFilteredSuggestions(props.suggestions);

    if (onConfirmed) {
      onConfirmed(value);
    }
  };

  const handleTermInput = (term: string) => {
    const _filteredSuggestions = filterSuggestions(props.suggestions, term);

    setTerm(term);
    setFilteredSuggestions(_filteredSuggestions);

    if (_filteredSuggestions.length === 0 && onEmptySuggestion) {
      onEmptySuggestion(term);
    }
  };

  const handleKeypress = (key: string) => {
    if (key === "Enter") {
      setTerm("");

      if (!term || !onConfirmed) {
        return;
      }

      const selectedSuggestion = filteredSuggestions.find((s) => s.id === selectedId);

      if (selectedSuggestion) {
        onConfirmed(selectedSuggestion.value);
      } else {
        onConfirmed(term);
      }
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      setSelectedId(selectSuggestion(selectedId, filteredSuggestions, key));
    }
  };

  const suggestionNodes = filteredSuggestions.map((obj) => {
    return (
      <li
        key={obj.id}
        className={classNames(Styles.suggestionNode(obj.id === selectedId))}
        data-testid={gen("suggestion")}
        data-id={obj.id}
        data-selected={obj.id === selectedId}
        onClick={() => handleClick(obj.value)}
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

  return (
    <span ref={ref} className={classNames(Styles.root)}>
      <Input
        focus={focusOnInit}
        value={term}
        onInput={handleTermInput}
        onKeypress={handleKeypress}
        placeholder={props.placeholder}
        testid={gen("term")}
      />
      <Dialog
        aligned='bottomRight'
        opened={opened}
        margin='top'
        parentRect={ref.current ? Rect.fromDOMRect(ref.current.getBoundingClientRect()) : undefined}
        testid={gen("root")}
      >
        <div className={classNames(Styles.suggestorMain(opened))} data-testid={gen("dialog")}>
          <ul className={classNames(Styles.suggestions)}>{suggestionNodes}</ul>
        </div>
      </Dialog>
    </span>
  );
}
