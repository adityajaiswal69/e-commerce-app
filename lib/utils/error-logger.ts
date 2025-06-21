type ErrorWithMessage = {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

// Production-safe error logger
export function logError(error: unknown, context?: string) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error(`${context ? `[${context}] ` : ''}Error:`, getErrorMessage(error));
    if (error instanceof Error) {
      console.error(error.stack);
    }
  } else {
    // In production, could send to a logging service like Sentry, DataDog, etc.
    // For now, just log the error message without the stack trace
    const errorMessage = getErrorMessage(error);
    // TODO: Send to logging service
  }
}
