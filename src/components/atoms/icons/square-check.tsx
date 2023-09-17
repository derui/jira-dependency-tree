import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const SquareCheck = function SquareCheck(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="square-check" {...{ testid, size, color }} />;
};
