/**
 * Application constants and configuration values
 * Centralized location for all constant values used throughout the app
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  REALTIME_STALE_TIME: 30 * 1000, // 30 seconds
  STATIC_CACHE_TIME: 60 * 60 * 1000, // 1 hour
} as const;

// UI Constants
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 4000,
  LOADING_DELAY: 200, // Delay before showing loading spinner
} as const;

// Tournament Constants
export const TOURNAMENT_CONFIG = {
  MIN_TEAMS: 2,
  MAX_TEAMS: 256,
  MIN_ROUNDS: 1,
  MAX_ROUNDS: 20,
  MIN_JUDGES: 1,
  BP_TEAMS_PER_ROOM: 4,
  DEFAULT_ROOMS: ['Room A', 'Room B', 'Room C'],
} as const;

// Debate Formats
export const DEBATE_FORMATS = {
  BP: 'British Parliamentary',
  WSDC: 'World Schools Debate Championship',
  APDA: 'American Parliamentary',
  POLICY: 'Policy Debate',
  CUSTOM: 'Custom Format',
} as const;

// Experience Levels
export const EXPERIENCE_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate',
  OPEN: 'open',
  PRO: 'pro',
} as const;

// Tournament Status
export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Round Status
export const ROUND_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Draw Status
export const DRAW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// User Roles
export const USER_ROLES = {
  TAB_MASTER: 'tab_master',
  ASSISTANT: 'assistant',
  ATTENDEE: 'attendee',
} as const;

// Permissions
export const PERMISSIONS = {
  CREATE_TOURNAMENT: 'create_tournament',
  EDIT_TOURNAMENT: 'edit_tournament',
  DELETE_TOURNAMENT: 'delete_tournament',
  VIEW_TOURNAMENT: 'view_tournament',
  MANAGE_TEAMS: 'manage_teams',
  EDIT_SCORES: 'edit_scores',
  VIEW_RESULTS: 'view_results',
  MANAGE_JUDGES: 'manage_judges',
  MANAGE_DRAWS: 'manage_draws',
  MANAGE_ROUNDS: 'manage_rounds',
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_ADMIN: 'system_admin',
} as const;

// File Upload
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx'],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please check your permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  SAVED: 'Successfully saved!',
  UPLOADED: 'Successfully uploaded!',
  EXPORTED: 'Successfully exported!',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'tabby_auth_token',
  USER_PREFERENCES: 'tabby_user_preferences',
  THEME: 'tabby_theme',
  LANGUAGE: 'tabby_language',
  RECENT_TOURNAMENTS: 'tabby_recent_tournaments',
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  TOURNAMENTS: 'tournaments',
  TOURNAMENT: 'tournament',
  TEAMS: 'teams',
  TEAM: 'team',
  ROUNDS: 'rounds',
  ROUND: 'round',
  DRAWS: 'draws',
  DRAW: 'draw',
  JUDGES: 'judges',
  JUDGE: 'judge',
  USER: 'user',
  PROFILE: 'profile',
  ANALYTICS: 'analytics',
} as const;

// British Parliamentary Positions
export const BP_POSITIONS = {
  OG: 'Opening Government',
  OO: 'Opening Opposition',
  CG: 'Closing Government',
  CO: 'Closing Opposition',
} as const;

// Color Schemes
export const COLORS = {
  PRIMARY: '#0F172A',
  SECONDARY: '#14B8A6',
  ACCENT: '#60A5FA',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  LIGHT: '#F8FAFC',
  DARK: '#0F172A',
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;