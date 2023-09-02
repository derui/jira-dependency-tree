import { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { UserConfigurationForm, Props as UserConfigurationFormProps } from "../molecules/user-configuration-form";
import { Dialog } from "../atoms/dialog";
import { iconize } from "../atoms/iconize";
import { submitApiCredential } from "@/state/actions";
import { FirstArg } from "@/util/type-tool";

export type Props = BaseProps;

const Styles = {
  root: classNames("inline-block", "relative"),
  toolbar: classNames(
    "flex",
    "relative",
    "flex-auto",
    "flex-col",
    "bg-white",
    "rounded",
    "shadow-md",
    "w-12",
    "h-12",
    "p-3",
    "items-center",
    "justify-center",
  ),
  opener: () => {
    return classNames("relative", "outline-none", "bg-white", "border-none", "flex-auto", "flex", "w-7", "h-7");
  },
  marker: (show: boolean) => {
    return classNames("flex", "w-2", "h-2", "-left-1", "-top-1", "absolute", !show ? "invisible" : "visible");
  },
  markerPing: classNames("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classNames("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
};

// eslint-disable-next-line func-style
export function UserConfiguration(props: Props) {
  const gen = generateTestId(props.testid);
  const ref = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const currentCredential = useAppSelector(getApiCrednetial());
  const dispatch = useAppDispatch();
  const setupFinished = currentCredential !== undefined;

  const handleEndEdit = (obj: FirstArg<UserConfigurationFormProps["onEndEdit"]>) => {
    if (obj) {
      dispatch(submitApiCredential(obj));
    }
    setOpened(false);
  };

  return (
    <div ref={ref} className={Styles.root}>
      <div className={Styles.toolbar}>
        <button
          className={(Styles.opener(), iconize({ type: "settings", color: "complement", size: "l" }))}
          data-testid={gen("opener")}
          onClick={() => setOpened(!opened)}
        >
          <span className={Styles.marker(!setupFinished)} aria-hidden={setupFinished} data-testid={gen("marker")}>
            <span className={Styles.markerPing}></span>
            <span className={Styles.markerInner}></span>
          </span>
        </button>
      </div>
      <Dialog
        testid="container"
        opened={opened}
        margin="top"
        parentRect={ref.current?.getBoundingClientRect()}
        aligned="bottomRight"
      >
        <UserConfigurationForm testid={gen("form")} initialPayload={currentCredential} onEndEdit={handleEndEdit} />
      </Dialog>
    </div>
  );
}
