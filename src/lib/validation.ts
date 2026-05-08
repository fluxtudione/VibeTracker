// Form validation utilities for authentication forms

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Object with valid status and optional error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate password
 * @param password - Password string to validate
 * @returns Object with valid status and optional error message
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  return { valid: true };
}

/**
 * Validate authentication form (email and password)
 * @param email - Email string
 * @param password - Password string
 * @returns FormErrors object with any validation errors
 */
export function validateAuthForm(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }

  return errors;
}

/**
 * Check if form has any validation errors
 * @param errors - FormErrors object
 * @returns Boolean indicating if there are any errors
 */
export function hasValidationErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
