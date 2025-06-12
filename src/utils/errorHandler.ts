/**
 * Centralized error handling utilities for the application
 * Provides consistent error handling patterns across components
 */

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  /**
   * Handles database errors with user-friendly messages
   * @param error - The error object from database operations
   * @returns Formatted error message for user display
   */
  static handleDatabaseError(error: any): string {
    console.error('Database error:', error);
    
    if (error?.code === 'PGRST204') {
      return 'Database schema error. Please contact support.';
    }
    
    if (error?.message?.includes('duplicate key')) {
      return 'This item already exists. Please use a different name.';
    }
    
    if (error?.message?.includes('foreign key')) {
      return 'Cannot delete this item as it is being used elsewhere.';
    }
    
    return error?.message || 'An unexpected database error occurred.';
  }

  /**
   * Handles API errors with appropriate user feedback
   * @param error - The error object from API calls
   * @returns Formatted error message for user display
   */
  static handleApiError(error: any): string {
    console.error('API error:', error);
    
    if (error?.status === 401) {
      return 'You are not authorized to perform this action.';
    }
    
    if (error?.status === 403) {
      return 'Access denied. Please check your permissions.';
    }
    
    if (error?.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error?.message || 'An unexpected error occurred.';
  }

  /**
   * Logs errors for monitoring and debugging
   * @param error - The error to log
   * @param context - Additional context about where the error occurred
   */
  static logError(error: any, context?: string): void {
    const errorLog: AppError = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      details: {
        stack: error?.stack,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      timestamp: new Date(),
    };
    
    console.error('Application Error:', errorLog);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    }
  }

  /**
   * Creates a standardized error response
   * @param message - User-friendly error message
   * @param code - Error code for debugging
   * @returns Standardized error object
   */
  static createError(message: string, code?: string): AppError {
    return {
      message,
      code,
      timestamp: new Date(),
    };
  }
}