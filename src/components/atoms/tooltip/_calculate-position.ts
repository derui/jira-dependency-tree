import { TooltipPositionType } from "./type";
import { Position } from "@/type";

/**
 * margin pixel
 */
const MARGIN = 8;
const REVERSE_SCALE = 0.9;

type Prop = {
  target: Element;
  tooltip: Element;
};

const calculateTopPosition = function calculateTopPosition({ target, tooltip }: Prop): Position {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const targetCenterX = targetRect.left + targetRect.width / 2;
  let tooltipLeft = targetCenterX - tooltipRect.width / REVERSE_SCALE / 2;

  if (tooltipLeft < 0 && targetRect.left >= MARGIN) {
    tooltipLeft = targetRect.left;
  } else if (tooltipLeft < 0) {
    tooltipLeft = MARGIN;
  }

  return {
    x: tooltipLeft,
    y: targetRect.top - tooltipRect.height / REVERSE_SCALE - MARGIN,
  };
};

const calculateBottomPosition = function calculateBottomPosition({ target, tooltip }: Prop): Position {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const targetCenterX = targetRect.left + targetRect.width / 2;
  let tooltipLeft = targetCenterX - tooltipRect.width / REVERSE_SCALE / 2;

  if (tooltipLeft < 0 && targetRect.left >= MARGIN) {
    tooltipLeft = targetRect.left;
  } else if (tooltipLeft < 0) {
    tooltipLeft = MARGIN;
  }

  return {
    x: tooltipLeft,
    y: targetRect.bottom + MARGIN,
  };
};

const calculateLeftPosition = function calculateLeftPosition({ target, tooltip }: Prop): Position {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const targetCenterY = targetRect.top + targetRect.height / 2;
  let tooltipTop = targetCenterY - tooltipRect.height / REVERSE_SCALE / 2;

  if (tooltipTop < 0 && targetRect.top >= MARGIN) {
    tooltipTop = targetRect.top;
  } else if (tooltipTop < 0) {
    tooltipTop = MARGIN;
  }

  return {
    x: targetRect.left - MARGIN - tooltipRect.width / REVERSE_SCALE,
    y: tooltipTop,
  };
};

const calculateRightPosition = function calculateRightPosition({ target, tooltip }: Prop): Position {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const targetCenterY = targetRect.top + targetRect.height / 2;
  let tooltipTop = targetCenterY - tooltipRect.height / REVERSE_SCALE / 2;

  if (tooltipTop < 0 && targetRect.top >= MARGIN) {
    tooltipTop = targetRect.top;
  } else if (tooltipTop < 0) {
    tooltipTop = MARGIN;
  }

  return {
    x: targetRect.right + MARGIN,
    y: tooltipTop,
  };
};

export const calculatePosition = function calculatePosition(
  pos: TooltipPositionType,
  targetElement: Element,
  tooltipElement: Element,
): Position {
  const prop = { target: targetElement, tooltip: tooltipElement };

  switch (pos) {
    case "top":
      return calculateTopPosition(prop);
    case "bottom":
      return calculateBottomPosition(prop);
    case "left":
      return calculateLeftPosition(prop);
    case "right":
      return calculateRightPosition(prop);
  }
};
