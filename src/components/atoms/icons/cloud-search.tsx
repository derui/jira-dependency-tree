import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const CloudSearch = function CloudSearch(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="cloud-search" {...{ testid, size, color }} />;
};
