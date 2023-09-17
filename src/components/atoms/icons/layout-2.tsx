import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Layout_2 = function Layout_2(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="layout-2" {...{ testid, size, color }} />;
};
