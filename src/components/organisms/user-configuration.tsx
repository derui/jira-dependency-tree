import React, { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Icon } from "../atoms/icon";
import { UserConfigurationForm, Props as UserConfigurationFormProps } from "../molecules/user-configuration-form";
import { Dialog } from "../atoms/dialog";
import { useAppDispatch, useAppSelector } from "../hooks";
import { submitApiCredential } from "@/state/actions";
import { FirstArg } from "@/util/type-tool";
import { getApiCrednetial } from "@/state/selectors/api-credential";

export type Props = BaseProps;

const Styles = {
  root: classes("flex", "relative"),
  toolbar: classes(
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
    return {
      ...classes("relative", "outline-none", "bg-white", "border-none", "flex-auto", "flex", "w-7", "h-7"),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("flex", "w-2", "h-2", "-left-1", "-top-1", "absolute"),
      ...(!show ? classes("invisible") : {}),
      ...(show ? classes("visible") : {}),
    };
  },
  markerPing: classes("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classes("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
};

export const UserConfiguration: React.FC<Props> = (props) => {
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
    <div ref={ref} className={classNames(Styles.root)}>
      <div className={classNames(Styles.toolbar)}>
        <button className={classNames(Styles.opener())} data-testid={gen("opener")} onClick={() => setOpened(!opened)}>
          <span
            className={classNames(Styles.marker(!setupFinished))}
            aria-hidden={setupFinished}
            data-testid={gen("marker")}
          >
            <span className={classNames(Styles.markerPing)}></span>
            <span className={classNames(Styles.markerInner)}></span>
          </span>
          <Icon size='l' type='settings' color='complement' />
        </button>
      </div>
      <Dialog
        testid='container'
        opened={opened}
        parentRect={ref.current?.getBoundingClientRect()}
        aligned='bottomRight'
      >
        <UserConfigurationForm testid='form' initialPayload={currentCredential} onEndEdit={handleEndEdit} />
      </Dialog>
    </div>
  );
};
