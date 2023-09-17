import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Plus = function Plus(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="plus" {...{ testid, size, color }} />;
};
