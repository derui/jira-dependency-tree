import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const BinaryTree = function BinaryTree(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="binary-tree" {...{ testid, size, color }} />;
};
