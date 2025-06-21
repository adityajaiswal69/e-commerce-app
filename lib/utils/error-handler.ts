import toast from 'react-hot-toast';

// Configuration for error handling
const ERROR_CONFIG = {
  enableConsoleLogging: process.env.NODE_ENV === 'development' && process.env.DISABLE_CONSOLE_LOGGING !== 'true',
  enableErrorReporting: process.env.NODE_ENV === 'production' || process.env.ENABLE_ERROR_REPORTING === 'true',
  enableToastErrors: true
};

// Error reporting service (can be extended to use external services like Sentry)
async function reportError(context: string, error: unknown): Promise<void> {
  // In production, you might want to send errors to a logging service
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_REPORTING_ENDPOINT) {
    try {
      await fetch(process.env.ERROR_REPORTING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
          url: typeof window !== 'undefined' ? window.location.href : 'Server'
        })
      });
    } catch (reportingError) {
      // Silently fail if error reporting fails
    }
  }
}

// Type for Supabase error objects
interface SupabaseError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Safe logging utility that respects environment and configuration
function safeLog(level: 'error' | 'warn' | 'info', ...args: unknown[]): void {
  // Only log if console logging is enabled
  if (ERROR_CONFIG.enableConsoleLogging) {
    try {
      // Check if console is available and has the required method
      if (typeof console !== 'undefined' && console && typeof console[level] === 'function') {
        // Use direct method access to avoid any casting issues
        if (level === 'error') {
          // eslint-disable-next-line no-console
          (console.error as (...data: unknown[]) => void)(...args);
        } else if (level === 'warn') {
          // eslint-disable-next-line no-console
          (console.warn as (...data: unknown[]) => void)(...args);
        } else {
          // eslint-disable-next-line no-console
          (console.info as (...data: unknown[]) => void)(...args);
        }
      }
    } catch (logError) {
      // Silently fail if logging fails - don't use console here to avoid recursion
    }
  }
}

// Safe error logging utility
export function safeErrorLog(context: string, error: unknown): void {
  try {
    // Log to console if enabled
    if (ERROR_CONFIG.enableConsoleLogging) {
      safeLog('error', `[${context}]`, error);

      if (error && typeof error === 'object') {
        const supabaseError = error as SupabaseError;

        // Check if error object has any meaningful content
        const hasContent = supabaseError.message || supabaseError.details || supabaseError.hint || supabaseError.code;

        if (hasContent) {
          safeLog('error', `[${context}] Error details:`, {
            message: supabaseError.message || 'No message',
            details: supabaseError.details || 'No details',
            hint: supabaseError.hint || 'No hint',
            code: supabaseError.code || 'No code',
            timestamp: new Date().toISOString(),
            fullError: error
          });
        } else {
          safeLog('error', `[${context}] Empty error object detected:`, {
            errorType: typeof error,
            errorConstructor: error.constructor?.name || 'Unknown',
            errorKeys: Object.keys(error),
            errorStringified: JSON.stringify(error),
            timestamp: new Date().toISOString()
          });
        }
      } else {
        safeLog('error', `[${context}] Non-object error:`, {
          errorType: typeof error,
          errorValue: error,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Report error for monitoring if enabled
    if (ERROR_CONFIG.enableErrorReporting) {
      reportError(context, error).catch(() => {
        // Silently fail if reporting fails
      });
    }
  } catch (loggingError) {
    // If all logging fails, silently continue - don't break the application
  }
}

// Extract safe error message from any error type
export function getSafeErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object') {
    const supabaseError = error as SupabaseError;
    return supabaseError.message || 'Unknown database error';
  }
  
  return 'Unexpected error occurred';
}

// Get user-friendly error message based on error code
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }
  
  const supabaseError = error as SupabaseError;
  const errorCode = supabaseError.code;
  const errorMessage = supabaseError.message || 'Unknown error';
  
  switch (errorCode) {
    case '42P01':
      return 'Database table not found. Please contact support to set up the system.';
    case '23505':
      return 'This record already exists. Please try again with different information.';
    case '23503':
      return 'Invalid reference to related data. Please check your input.';
    case '23502':
      return 'Required information is missing. Please fill in all required fields.';
    case 'PGRST116':
      return 'Database connection error. Please check your internet connection and try again.';
    case 'PGRST301':
      return 'You do not have permission to perform this action.';
    case '08006':
      return 'Database connection failed. Please try again later.';
    case '28000':
      return 'Authentication failed. Please sign in again.';
    default:
      return `Error: ${errorMessage}`;
  }
}

// Handle Supabase errors with user feedback
export function handleSupabaseError(context: string, error: unknown): void {
  safeErrorLog(context, error);

  if (ERROR_CONFIG.enableToastErrors) {
    const userMessage = getUserFriendlyErrorMessage(error);
    toast.error(userMessage);
  }
}

// Async error wrapper for functions
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  showToast: boolean = true
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    safeErrorLog(context, error);
    
    if (showToast) {
      const userMessage = getUserFriendlyErrorMessage(error);
      toast.error(userMessage);
    }
    
    return null;
  }
}

// Sync error wrapper for functions
export function withSyncErrorHandling<T>(
  fn: () => T,
  context: string,
  showToast: boolean = true
): T | null {
  try {
    return fn();
  } catch (error) {
    safeErrorLog(context, error);
    
    if (showToast) {
      const userMessage = getUserFriendlyErrorMessage(error);
      toast.error(userMessage);
    }
    
    return null;
  }
}

// Validation helper
export function validateRequired(data: Record<string, unknown>, requiredFields: string[]): boolean {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    toast.error(`Missing required fields: ${missingFields.join(', ')}`);
    return false;
  }

  return true;
}
