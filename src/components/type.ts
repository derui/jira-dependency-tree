export const ColorSchema = {
  primary: "primary",
  secondary1: "secondary1",
  gray: "gray",
  secondary2: "secondary2",
  complement: "complement",
} as const;

/**
 * common color schema in application
 */
export type ColorSchema = typeof ColorSchema[keyof typeof ColorSchema];
