import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Pencil = function Pencil(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="pencil" {...{ testid, size, color }} />;
};
