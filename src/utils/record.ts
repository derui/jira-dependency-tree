/**
 * return new record mapped key with mapper
 */
export const mapKey = function mapKey(
  record: Record<string, unknown>,
  mapper: (key: string) => string,
): Record<string, unknown> {
  const ret = {} as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    ret[mapper(key)] = record[key];
  }

  return ret;
};

/**
 * return new record mapped value with mapper
 */
export const mapValue = function mapValue<T, V>(
  record: Record<string, T>,
  mapper: (value: T) => V | undefined,
): Record<string, V> {
  const ret = {} as Record<string, V>;

  for (const key of Object.keys(record)) {
    const value = mapper(record[key]);
    if (!value) {
      continue;
    }
    ret[key] = value;
  }

  return ret;
};
