import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional text to display below spinner */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'muted';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  primary: 'text-tabby-primary',
  secondary: 'text-tabby-secondary',
  muted: 'text-gray-400',
};

/**
 * Optimized loading spinner component with consistent styling
 * Memoized to prevent unnecessary re-renders
 */
export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({
  size = 'md',
  text,
  className,
  centered = false,
  variant = 'secondary',
}) => {
  const spinnerContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <span className={cn(
          'text-sm font-medium',
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
});

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Full page loading spinner for route transitions
 */
export const FullPageLoader = React.memo<{ text?: string }>(({ text = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="xl" text={text} variant="primary" />
  </div>
));

FullPageLoader.displayName = 'FullPageLoader';

/**
 * Inline loading state for buttons
 */
export const ButtonLoader = React.memo<{ text?: string }>(({ text }) => (
  <LoadingSpinner size="sm" text={text} className="text-current" />
));

ButtonLoader.displayName = 'ButtonLoader';