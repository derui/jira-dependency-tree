import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const ArrowBack = function ArrowBack(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="arrow-back" {...{ testid, size, color }} />;
};
