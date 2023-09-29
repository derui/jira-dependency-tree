import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Trash = function Trash(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="trash" {...{ testid, size, color }} />;
};
