import { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { UserConfigurationForm, Props as UserConfigurationFormProps } from "../molecules/user-configuration-form";
import { Dialog } from "../atoms/dialog";
import { IconButton } from "../atoms/icon-button";
import { Settings } from "../atoms/icons";
import { FirstArg } from "@/utils/type-tool";
import { useUserConfiguration } from "@/hooks/user-configuration";

export type Props = BaseProps;

const Styles = {
  root: classNames("inline-block", "relative"),
  toolbar: classNames(
    "flex",
    "relative",
    "flex-auto",
    "bg-white",
    "rounded",
    "shadow-md",
    "w-12",
    "h-12",
    "items-center",
    "justify-center",
  ),
  marker: (show: boolean) => {
    return classNames("flex", "w-2", "h-2", "left-2", "top-2", "absolute", !show ? "invisible" : "visible");
  },
  markerPing: classNames("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classNames("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
};

// eslint-disable-next-line func-style
export function UserConfiguration(props: Props) {
  const gen = generateTestId(props.testid);
  const ref = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const { state, apply } = useUserConfiguration();

  const handleEndEdit = (obj: FirstArg<UserConfigurationFormProps["onEndEdit"]>) => {
    if (obj) {
      apply(obj);
    }
    setOpened(false);
  };

  return (
    <div ref={ref} className={Styles.root}>
      <div className={Styles.toolbar}>
        <IconButton color="complement" size="l" testid={gen("opener")} onClick={() => setOpened(!opened)}>
          <Settings size="l" color="complement" />
          <span
            className={Styles.marker(!state.setupFinished)}
            aria-hidden={state.setupFinished}
            data-testid={gen("marker")}
          >
            <span className={Styles.markerPing}></span>
            <span className={Styles.markerInner}></span>
          </span>
        </IconButton>
      </div>
      <Dialog
        testid="container"
        opened={opened}
        margin="top"
        parentRect={ref.current?.getBoundingClientRect()}
        aligned="bottomRight"
      >
        <UserConfigurationForm testid={gen("form")} initialPayload={state.credential} onEndEdit={handleEndEdit} />
      </Dialog>
    </div>
  );
}
