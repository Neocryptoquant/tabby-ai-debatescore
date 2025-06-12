/**
 * Centralized type definitions for the application
 * Provides consistent typing across all components
 */

// Re-export tournament types
export * from './tournament';

// Common utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

// Form types
export type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
};

// Component props types
export type BaseComponentProps = {
  className?: string;
  children?: React.ReactNode;
};

export type LoadingProps = {
  isLoading?: boolean;
  loadingText?: string;
};

export type ErrorProps = {
  error?: string | null;
  onRetry?: () => void;
};

// Event handler types
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type AsyncEventHandlerWithParam<P, T = void> = (param: P) => Promise<T>;

// Database operation types
export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete';

export type OperationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Permission types
export type UserRole = 'tab_master' | 'assistant' | 'attendee';

export type Permission = 
  | 'create_tournament'
  | 'edit_tournament'
  | 'delete_tournament'
  | 'view_tournament'
  | 'manage_teams'
  | 'edit_scores'
  | 'view_results'
  | 'manage_judges'
  | 'manage_draws'
  | 'manage_rounds'
  | 'view_analytics'
  | 'system_admin';

// UI state types
export type Theme = 'light' | 'dark' | 'system';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ModalState = {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
};

// Navigation types
export type NavigationItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<any>;
  permission?: Permission;
  children?: NavigationItem[];
};

// Search and filter types
export type SortDirection = 'asc' | 'desc';

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

export type FilterConfig<T> = {
  key: keyof T;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
};

export type SearchConfig = {
  query: string;
  fields: string[];
};

// Performance monitoring types
export type PerformanceMetric = {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
};

export type ErrorLog = {
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  metadata?: Record<string, any>;
};