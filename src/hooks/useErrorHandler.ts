import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  context?: ErrorContext;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];

  log(error: Error | string, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const logEntry: ErrorLogEntry = {
      timestamp,
      message,
      stack,
      context
    };

    this.logs.push(logEntry);

    // In production, would send to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.group(
        `🔴 Error ${context?.component ? `in ${context.component}` : ''}`
      );
      console.error('Message:', message);
      if (context) console.error('Context:', context);
      if (stack) console.error('Stack:', stack);
      console.groupEnd();
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton to maintain consistent logs
const errorLogger = new ErrorLogger();

export const useErrorHandler = () => {
  const handleError = useCallback(
    (error: Error | string, context?: ErrorContext) => {
      errorLogger.log(error, context);

      const message = error instanceof Error ? error.message : error;

      // Show toast to user with a friendly message
      toast.error(message);
    },
    []
  );

  const handleAsyncError = useCallback(
    async (
      asyncOperation: () => Promise<any>,
      context?: ErrorContext
    ): Promise<any> => {
      try {
        return await asyncOperation();
      } catch (error) {
        handleError(error as Error, context);
        throw error; // Re-throw so the component can handle it if necessary
      }
    },
    [handleError]
  );

  const getErrorLogs = useCallback(() => {
    return errorLogger.getLogs();
  }, []);

  const clearErrorLogs = useCallback(() => {
    errorLogger.clearLogs();
  }, []);

  return {
    handleError,
    handleAsyncError,
    getErrorLogs,
    clearErrorLogs
  };
};
