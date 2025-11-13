/**
 * Password Hashing Utilities
 * 
 * Provides secure password hashing and verification using bcryptjs.
 * 
 * @module lib/password
 */

import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt (higher = more secure but slower)
 * 12 rounds provides strong security while maintaining reasonable performance
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 * @throws Error if hashing fails
 * 
 * @example
 * const hashed = await hashPassword('mySecurePassword123');
 * // Returns: $2a$12$...
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

/**
 * Verify a plain text password against a hashed password
 * 
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 * 
 * @example
 * const isValid = await verifyPassword('myPassword', hashedPassword);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }
  
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

/**
 * Validate password strength
 * 
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true };
}
