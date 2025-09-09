/**
 * Shared types for the application
 */

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  firstName: string;
  lastName: string;
};
