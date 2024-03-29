/**
   Make difference between two sets.

   Return new Set [a - b]. Returned set contains elements that are not in [b].
 */
export const difference = function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>(a);

  for (const v of b) {
    diff.delete(v);
  }

  return diff;
};

/**
   Make intersect between two sets.

   Return new Set
 */
export const intercect = function intercect<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>();

  for (const v of a) {
    if (a.has(v) && b.has(v)) {
      diff.add(v);
    }
  }

  return diff;
};

// check constraint and throw error if constraint is broken.
export const constraint = function constraint(condition: boolean, message?: string) {
  const revisedMessage = message ?? "Detect invalid constraint";

  if (!condition) {
    throw Error(revisedMessage);
  }
};

// A simple type guard to remove undefined
export const filterUndefined = function filterUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
};

// A simple type guard to remove null
export const filterNull = function filterNull<T>(value: T | null): value is T {
  return value !== null;
};

// A simple type guard to remove blank string
export const filterEmptyString = function filterEmptyString(value: string | undefined): value is string {
  if (value === undefined) return false;

  return value.trim().length > 0;
};

// Deadly simple rect class
export class Rect {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  constructor(args: { top: number; left: number; right: number; bottom: number }) {
    this.top = args.top;
    this.left = args.left;
    this.right = args.right;
    this.bottom = args.bottom;
  }

  /**
   * A shortcut function to create `Rect` from `DOMRect`
   */
  static fromDOMRect(rect: DOMRect) {
    return new Rect({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    });
  }

  static empty() {
    return new Rect({ left: 0, top: 0, bottom: 0, right: 0 });
  }

  get height() {
    return Math.max(this.bottom - this.top, 0);
  }

  get width() {
    return Math.max(this.right - this.left, 0);
  }
}
