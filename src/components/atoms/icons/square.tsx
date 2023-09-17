import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Square = function Square(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="square" {...{ testid, size, color }} />;
};
