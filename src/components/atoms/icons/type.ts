export const IconType = {
  "chevron-down": "before:[mask-image:url(/svg/tabler-icons/chevron-down.svg)]",
  "layout-2": "before:[mask-image:url(/svg/tabler-icons/layout-2.svg)]",
  "layout-distribute-horizontal": "before:[mask-image:url(/svg/tabler-icons/layout-distribute-horizontal.svg)]",
  "layout-distribute-vertical": "before:[mask-image:url(/svg/tabler-icons/layout-distribute-vertical.svg)]",
  refresh: "before:[mask-image:url(/svg/tabler-icons/refresh.svg)]",
  search: "before:[mask-image:url(/svg/tabler-icons/search.svg)]",
  settings: "before:[mask-image:url(/svg/tabler-icons/settings.svg)]",
  "square-check": "before:[mask-image:url(/svg/tabler-icons/square-check.svg)]",
  square: "before:[mask-image:url(/svg/tabler-icons/square.svg)]",
  x: "before:[mask-image:url(/svg/tabler-icons/x.svg)]",
  plus: "before:[mask-image:url(/svg/tabler-icons/plus.svg)]",
  "arrow-back": "before:[mask-image:url(/svg/tabler-icons/arrow-back.svg)]",
  pencil: "before:[mask-image:url(/svg/tabler-icons/pencil.svg)]",
  "loader-2": "before:[mask-image:url(/svg/tabler-icons/loader-2.svg)]",
  "chevron-left": "before:[mask-image:url(/svg/tabler-icons/chevron-left.svg)]",
  "chevron-right": "before:[mask-image:url(/svg/tabler-icons/chevron-right.svg)]",
  "cloud-search": "before:[mask-image:url(/svg/tabler-icons/cloud-search.svg)]",
  "binary-tree": "before:[mask-image:url(/svg/tabler-icons/binary-tree.svg)]",
  check: "before:[mask-image:url(/svg/tabler-icons/check.svg)]",
  trash: "before:[mask-image:url(/svg/tabler-icons/trash.svg)]",
  "list-search": "before:[mask-image:url(/svg/tabler-icons/list-search.svg)]",
} as const;
export type IconType = keyof typeof IconType;

/**
 * size of icons
 */
export type IconSize = "s" | "m" | "l";
