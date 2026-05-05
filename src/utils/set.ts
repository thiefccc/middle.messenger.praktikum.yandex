import { Indexed } from '../types/indexed';
import merge from './merge';

function isIndexed(value: unknown): value is Indexed {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function set(object: Indexed | unknown, path: string, value: unknown): Indexed | unknown {
  if (typeof path !== 'string') {
    throw new Error('path must be string');
  }

  if (!isIndexed(object)) {
    return object;
  }

  // nest
  const nested = path
    .split('.')
    .reduceRight<Indexed | unknown>((accumulator, key) => ({ [key]: accumulator }), value) as Indexed;

  const merged = merge(object, nested);

  // mutate
  for (const key of Object.keys(merged)) {
    object[key] = merged[key];
  }

  return object;
}

export default set;
