import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Refresh = function Refresh(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="refresh" {...{ testid, size, color }} />;
};
