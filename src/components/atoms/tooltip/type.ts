import { Position } from "@/type";

/**
 * position of tooltip
 */
export type TooltipPositionType = "left" | "right" | "top" | "bottom";

export type TooltipPosition = {
  /**
   * should display or not
   */
  display: boolean;

  /**
   * Type of displaying tooltip
   */
  type: TooltipPositionType;

  /**
   * Absolute position of tooltip. This property should be undefined if `display` is `false`
   */
  position?: Position;
};
