import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const ListSearch = function ListSearch(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="list-search" {...{ testid, size, color }} />;
};
