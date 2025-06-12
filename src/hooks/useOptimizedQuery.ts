import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Optimized query hook with built-in error handling and caching strategies
 * Provides consistent query patterns across the application
 */
export function useOptimizedQuery<TData, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    errorContext?: string;
    successMessage?: string;
  }
) {
  const { handleError } = useErrorHandler();

  // Memoize query key to prevent unnecessary re-renders
  const memoizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  // Enhanced query function with error handling
  const enhancedQueryFn = useCallback(async () => {
    try {
      return await queryFn();
    } catch (error) {
      handleError(error, options?.errorContext);
      throw error;
    }
  }, [queryFn, handleError, options?.errorContext]);

  // Default query options for performance
  const defaultOptions: UseQueryOptions<TData, TError> = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };

  return useQuery({
    queryKey: memoizedQueryKey,
    queryFn: enhancedQueryFn,
    ...defaultOptions,
    ...options,
  });
}

/**
 * Hook for queries that should refetch on window focus
 * Useful for real-time data that needs to stay fresh
 */
export function useRealtimeQuery<TData, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Parameters<typeof useOptimizedQuery>[2]
) {
  return useOptimizedQuery(queryKey, queryFn, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
}

/**
 * Hook for queries that should be cached for a long time
 * Useful for relatively static data like user profiles, settings
 */
export function useCachedQuery<TData, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Parameters<typeof useOptimizedQuery>[2]
) {
  return useOptimizedQuery(queryKey, queryFn, {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    ...options,
  });
}