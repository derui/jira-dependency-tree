import classNames from "classnames";
import { useDispatch } from "react-redux";
import { BaseProps, generateTestId } from "../helper";
import { useAppSelector } from "../hooks";
import { iconize } from "../atoms/iconize";
import { isSyncable, queryIssues } from "@/state/selectors/issues";
import { Loading } from "@/type";
import { synchronizeIssues } from "@/state/actions";

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
  const syncable = useAppSelector(isSyncable());
  const [loading] = useAppSelector(queryIssues());
  const dispatch = useDispatch();

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <button
        className={Styles.icon(loading === Loading.Loading, syncable)}
        disabled={!syncable}
        aria-disabled={!syncable}
        data-testid={gen("button")}
        onClick={() => {
          dispatch(synchronizeIssues());
        }}
      ></button>
    </div>
  );
}
