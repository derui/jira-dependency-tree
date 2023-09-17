import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const TransferIn = function TransferIn(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="transfer-in" {...{ testid, size, color }} />;
};
