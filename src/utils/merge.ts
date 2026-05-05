import { Indexed } from '../types/indexed';

function isIndexed(value: unknown): value is Indexed {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge(lhs: Indexed, rhs: Indexed): Indexed {
  const result: Indexed = { ...lhs };

  for (const key of Object.keys(rhs)) {
    result[key] =
      isIndexed(result[key]) && isIndexed(rhs[key])
        ? merge(result[key] as Indexed, rhs[key] as Indexed)
        : rhs[key];
  }

  return result;
}

export default merge;
