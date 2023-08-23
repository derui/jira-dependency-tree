import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { useSynchronize } from "@/hooks";

export type Props = BaseProps;

const Styles = {
  root: classNames("flex", "justify-center", "relative", "w-12", "items-center"),
  icon: (syncing: boolean, syncable: boolean) => {
    return classNames("w-8", "h-8", iconize({ type: "refresh", size: "l", color: "complement", disabled: !syncable }), {
      "animate-spin": syncing,
    });
  },
};

// eslint-disable-next-line func-style
export function SyncIssueButton(props: Props) {
  const gen = generateTestId(props.testid);
  const { isEnabled, sync, isLoading } = useSynchronize();

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <button
        className={Styles.icon(isLoading, isEnabled)}
        disabled={!isEnabled}
        aria-disabled={!isEnabled}
        data-testid={gen("button")}
        onClick={() => {
          sync();
        }}
      ></button>
    </div>
  );
}
