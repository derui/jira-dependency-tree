import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Loader_2 = function Loader_2(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="loader-2" {...{ testid, size, color }} />;
};
