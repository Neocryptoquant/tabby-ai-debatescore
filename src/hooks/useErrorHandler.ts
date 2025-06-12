import { useCallback } from 'react';
import { toast } from 'sonner';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Custom hook for consistent error handling across components
 * Provides standardized error handling with user feedback
 */
export const useErrorHandler = () => {
  /**
   * Handles errors with appropriate user feedback and logging
   * @param error - The error to handle
   * @param context - Additional context about where the error occurred
   * @param customMessage - Optional custom message to display to user
   */
  const handleError = useCallback((
    error: any, 
    context?: string, 
    customMessage?: string
  ) => {
    // Log the error for debugging
    ErrorHandler.logError(error, context);
    
    // Determine appropriate user message
    let userMessage = customMessage;
    
    if (!userMessage) {
      if (error?.code?.startsWith('PGRST') || error?.message?.includes('supabase')) {
        userMessage = ErrorHandler.handleDatabaseError(error);
      } else if (error?.status) {
        userMessage = ErrorHandler.handleApiError(error);
      } else {
        userMessage = error?.message || 'An unexpected error occurred';
      }
    }
    
    // Show user-friendly error message
    toast.error(userMessage);
  }, []);

  /**
   * Handles async operations with error handling
   * @param operation - The async operation to execute
   * @param context - Context for error logging
   * @param successMessage - Optional success message
   */
  const handleAsyncOperation = useCallback(async (
    operation: () => Promise<any>,
    context?: string,
    successMessage?: string
  ) => {
    try {
      const result = await operation();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw for component-specific handling if needed
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncOperation,
  };
};