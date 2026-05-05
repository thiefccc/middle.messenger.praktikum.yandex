function cloneDeep<T extends object = object>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null ? cloneDeep(item) : item,
    ) as T;
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];

    result[key] =
      typeof value === 'object' && value !== null
        ? cloneDeep(value as object)
        : value;
  }

  return result as T;
}

export default cloneDeep;
