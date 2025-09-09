/**
 * Simplified form validators
 */
import { z } from "zod";
import { env } from "~/lib/env";

export class AuthValidators {
  private readonly emailSchema: z.ZodTypeAny;
  private readonly passwordSchema: z.ZodString;

  constructor() {
    this.emailSchema = z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email format" })
      .transform((s) => s.toLowerCase().trim());

    this.passwordSchema = z
      .string()
      .min(1, { message: "Password is required" })
      .min(env.PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${env.PASSWORD_MIN_LENGTH} characters`,
      });
  }

  /**
   * Validate login form
   */
  validateLoginForm(data: { email: string; password: string }) {
    const errors: Record<string, string> = {};

    try {
      this.emailSchema.parse(data.email);
    } catch (e) {
      const ze = e as z.ZodError;
      errors.email = ze?.issues?.[0]?.message || "Invalid email";
    }

    if (!data.password) {
      errors.password = "Password is required";
    }

    return errors;
  }

  /**
   * Validate registration form
   */
  validateRegistrationForm(data: {
    email: string;
    password: string;
    passwordConfirm: string;
    role: string;
    firstName: string;
    lastName: string;
  }) {
    const errors: Record<string, string> = {};

    try {
      this.emailSchema.parse(data.email);
    } catch (e) {
      const ze = e as z.ZodError;
      errors.email = ze?.issues?.[0]?.message || "Invalid email";
    }

    try {
      this.passwordSchema.parse(data.password);
    } catch (e) {
      const ze = e as z.ZodError;
      errors.password = ze?.issues?.[0]?.message || "Invalid password";
    }

    if (!data.passwordConfirm) {
      errors.passwordConfirm = "Password confirmation is required";
    } else if (data.password !== data.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }

    if (!data.role) {
      errors.role = "Role is required";
    } else if (!["OWNER", "WORKER"].includes(data.role)) {
      errors.role = "Invalid role. Available roles: OWNER, WORKER";
    }

    if (!data.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!data.lastName?.trim()) {
      errors.lastName = "Last name is required";
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    return errors;
  }
}
