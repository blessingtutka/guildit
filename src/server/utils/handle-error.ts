import type { Context } from 'hono';
import { AppError } from './errors';

export function handleError(c: Context, error: unknown) {
  if (error instanceof AppError) {
    console.warn(`[${error.name}] ${error.message}`);
    return c.json(
      { status: 'error' as const, message: error.message },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error.statusCode as any
    );
  }

  console.error('[UnhandledError]', error);
  return c.json(
    { status: 'error' as const, message: 'Internal server error' },
    500
  );
}
