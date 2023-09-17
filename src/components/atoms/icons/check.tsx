import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Check = function Check(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="check" {...{ testid, size, color }} />;
};
