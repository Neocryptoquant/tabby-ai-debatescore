/**
 * Performance optimization utilities
 * Provides tools for monitoring and improving application performance
 */

/**
 * Debounce function to limit the rate of function execution
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @param immediate - Whether to execute immediately on first call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution frequency
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive calculations
 * @param fn - Function to memoize
 * @param getKey - Function to generate cache key
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  /**
   * Start measuring performance for a given operation
   * @param name - Name of the operation
   */
  static start(name: string): void {
    this.measurements.set(name, performance.now());
  }

  /**
   * End measurement and log the duration
   * @param name - Name of the operation
   * @param logToConsole - Whether to log to console
   */
  static end(name: string, logToConsole = true): number {
    const startTime = this.measurements.get(name);
    
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    if (logToConsole) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  /**
   * Measure the execution time of an async function
   * @param name - Name of the operation
   * @param fn - Function to measure
   */
  static async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

/**
 * Lazy loading utility for components
 * @param importFn - Dynamic import function
 * @param fallback - Fallback component while loading
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return React.memo((props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : null}>
      <LazyComponent {...props} />
    </React.Suspense>
  ));
}

/**
 * Image optimization utility
 */
export const ImageOptimizer = {
  /**
   * Generate responsive image URLs for different screen sizes
   * @param baseUrl - Base image URL
   * @param sizes - Array of sizes to generate
   */
  generateResponsiveUrls(baseUrl: string, sizes: number[] = [400, 800, 1200]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  },

  /**
   * Preload critical images
   * @param urls - Array of image URLs to preload
   */
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },
};