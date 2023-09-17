import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const Search = function Search(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="search" {...{ testid, size, color }} />;
};
