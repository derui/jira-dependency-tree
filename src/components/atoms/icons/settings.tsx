import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Settings = function Settings(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="settings" {...{ testid, size, color }} />;
};
