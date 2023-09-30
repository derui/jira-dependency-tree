---
to: src/components/atoms/icons/<%= iconType %>.tsx
---
import { Icon, BaseIconProps } from "./_base"

type Props = Omit<BaseIconProps, 'iconType'>

export const <%= h.changeCase.pascal(iconType) %> = function <%= h.changeCase.pascal(iconType) %>(props: Props) {
  const {testid, size, color} = props;

  return <Icon iconType="<%= iconType %>" {...{testid, size,color}}  />
}
