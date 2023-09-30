export * from "./arrow-back";
export * from "./binary-tree";
export * from "./chevron-down";
export * from "./chevron-left";
export * from "./chevron-right";
export * from "./layout-2";
export * from "./loader-2";
export * from "./pencil";
export * from "./plus";
export * from "./refresh";
export * from "./search";
export * from "./settings";
export * from "./square-check";
export * from "./square";
export * from "./cloud-search";
export * from "./x";
export * from "./check";
export * from "./layout-distribute-horizontal";
export * from "./layout-distribute-vertical";
export * from "./trash";

import { BaseIconProps, Icon } from "./_base";
export { Icon };

export { IconType } from "./type";

// support prop type
export type IconProps = Omit<BaseIconProps, "iconType">;
