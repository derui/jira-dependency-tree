import classNames from "classnames";
import { useDispatch } from "react-redux";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppSelector } from "../hooks";
import { Icon } from "../atoms/icon";
import { isSyncable, queryIssues } from "@/state/selectors/issues";
import { Loading } from "@/type";
import { synchronizeIssues } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  root: classes("flex", "justify-center", "relative", "w-12"),
  main: () => {
    return {
      ...classes("outline-none", "bg-white", "inline-block", "rounded", "cursor-pointer"),
    };
  },
  icon: (syncing: boolean) => {
    return syncing ? classes("animate-spin") : {};
  },
};

// eslint-disable-next-line func-style
export function SyncIssueButton(props: Props) {
  const gen = generateTestId(props.testid);
  const syncable = useAppSelector(isSyncable());
  const [loading] = useAppSelector(queryIssues());
  const dispatch = useDispatch();

  return (
    <div className={classNames(Styles.root)} data-testid={gen("root")}>
      <button
        disabled={!syncable}
        aria-disabled={!syncable}
        data-testid={gen("button")}
        onClick={() => {
          dispatch(synchronizeIssues());
        }}
      >
        <Icon
          type='refresh'
          testid={gen("sync")}
          size='l'
          style={Styles.icon(loading === Loading.Loading)}
          color="complement"
          disabled={!syncable}
        ></Icon>
      </button>
    </div>
  );
}
