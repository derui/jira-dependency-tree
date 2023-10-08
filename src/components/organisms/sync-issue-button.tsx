import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "../atoms/icon-button";
import { Refresh } from "../atoms/icons";
import { useSynchronize } from "@/hooks";

export type Props = BaseProps;

const Styles = {
  root: (syncing: boolean) =>
    classNames("flex", "justify-center", "relative", "w-12", "items-center", {
      "animate-spin": syncing,
    }),
};

// eslint-disable-next-line func-style
export function SyncIssueButton(props: Props) {
  const gen = generateTestId(props.testid);
  const { isEnabled, sync, isLoading } = useSynchronize();

  return (
    <div className={Styles.root(isLoading)} data-syncing={isLoading} data-testid={gen("root")}>
      <IconButton
        color="complement"
        disabled={!isEnabled}
        testid={gen("button")}
        onClick={() => {
          sync();
        }}
      >
        <Refresh color={isEnabled ? "complement" : "gray"} />
      </IconButton>
    </div>
  );
}
