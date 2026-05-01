import type { HTTPError } from './HTTPTransport';

export function extractReason(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const err = error as HTTPError;
    if (err.response) {
      try {
        const parsed = JSON.parse(err.response);
        if (parsed && typeof parsed.reason === 'string') {
          return parsed.reason;
        }
      } catch {
        return err.response;
      }
    }
    if (err.reason) {
      return err.reason;
    }
  }
  return fallback;
}

export default extractReason;
