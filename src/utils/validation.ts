import { z } from 'zod';
import { VALIDATION_RULES } from '@/lib/constants';

/**
 * Centralized validation schemas and utilities
 * Provides consistent validation across the application
 */

// Base schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(VALIDATION_RULES.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`)
  .max(VALIDATION_RULES.MAX_PASSWORD_LENGTH, `Password must be less than ${VALIDATION_RULES.MAX_PASSWORD_LENGTH} characters`);

export const nameSchema = z
  .string()
  .min(VALIDATION_RULES.MIN_NAME_LENGTH, `Name must be at least ${VALIDATION_RULES.MIN_NAME_LENGTH} characters`)
  .max(VALIDATION_RULES.MAX_NAME_LENGTH, `Name must be less than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`)
  .trim();

export const descriptionSchema = z
  .string()
  .min(VALIDATION_RULES.MIN_DESCRIPTION_LENGTH, `Description must be at least ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} characters`)
  .max(VALIDATION_RULES.MAX_DESCRIPTION_LENGTH, `Description must be less than ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`)
  .optional();

// Auth schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  institution: z.string().optional(),
});

// Tournament schemas
export const tournamentSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  format: z.enum(['bp', 'wsdc', 'apda', 'policy', 'custom']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  team_count: z.number().min(2).max(256).optional(),
  round_count: z.number().min(1).max(20).optional(),
  motions_per_round: z.number().min(1).max(5).optional(),
  break_type: z.enum(['none', 'finals', 'semis', 'quarters']).optional(),
  status: z.enum(['upcoming', 'active', 'completed']).optional(),
});

// Team schemas
export const teamSchema = z.object({
  name: nameSchema,
  institution: z.string().optional(),
  speaker_1: nameSchema.optional(),
  speaker_2: nameSchema.optional(),
  experience_level: z.enum(['novice', 'intermediate', 'open', 'pro']).optional(),
  break_category: z.string().optional(),
});

// Judge schemas
export const judgeSchema = z.object({
  name: nameSchema,
  institution: z.string().optional(),
  experience_level: z.enum(['novice', 'intermediate', 'open', 'pro']),
});

// Round schemas
export const roundSchema = z.object({
  round_number: z.number().min(1).max(20),
  motion: z.string().min(10, 'Motion must be at least 10 characters'),
  info_slide: z.string().max(1000, 'Info slide must be less than 1000 characters').optional(),
  start_time: z.string().optional(),
  is_motion_public: z.boolean().optional(),
  is_info_slide_public: z.boolean().optional(),
  default_rooms: z.array(z.string()).optional(),
});

// Profile schemas
export const profileSchema = z.object({
  full_name: nameSchema,
  institution: z.string().optional(),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
});

// CSV validation
export const csvTeamSchema = z.object({
  team_name: nameSchema,
  institution: z.string().optional(),
  speaker_1: nameSchema,
  speaker_2: nameSchema,
});

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  }

  /**
   * Validates password strength
   */
  static isValidPassword(password: string): boolean {
    return password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH &&
           password.length <= VALIDATION_RULES.MAX_PASSWORD_LENGTH;
  }

  /**
   * Validates file type for uploads
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validates file size
   */
  static isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  /**
   * Sanitizes string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validates URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates date format and range
   */
  static isValidDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date('1900-01-01');
  }

  /**
   * Validates that end date is after start date
   */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  }
}

/**
 * Form validation helpers
 */
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};