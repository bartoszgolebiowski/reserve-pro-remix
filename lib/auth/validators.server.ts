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

  /**
   * Validate employee creation
   */
  validateEmployeeCreation(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    employeeType: string;
    locations: string[];
    hourlyRates: Record<string, number>;
  }) {
    const errors: Record<string, string> = {};

    // Basic validation
    if (!data.firstName?.trim()) {
      errors.firstName = "Imię jest wymagane";
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = "Imię musi mieć co najmniej 2 znaki";
    }

    if (!data.lastName?.trim()) {
      errors.lastName = "Nazwisko jest wymagane";
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = "Nazwisko musi mieć co najmniej 2 znaki";
    }

    try {
      this.emailSchema.parse(data.email);
    } catch (e) {
      const ze = e as z.ZodError;
      errors.email = ze?.issues?.[0]?.message === "Invalid email format" 
        ? "Nieprawidłowy format email" 
        : "Email jest wymagany";
    }

    if (data.phone && data.phone.trim() !== "") {
      const phoneRegex = /^\+?[\d\s\-\(\)]{9,}$/;
      if (!phoneRegex.test(data.phone.trim())) {
        errors.phone = "Nieprawidłowy format numeru telefonu";
      }
    }

    try {
      this.passwordSchema.parse(data.password);
    } catch (e) {
      const ze = e as z.ZodError;
      errors.password = ze?.issues?.[0]?.message === `Password must be at least ${env.PASSWORD_MIN_LENGTH} characters`
        ? `Hasło musi mieć co najmniej ${env.PASSWORD_MIN_LENGTH} znaków`
        : "Hasło jest wymagane";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Hasła nie są identyczne";
    }

    if (!data.employeeType) {
      errors.employeeType = "Typ pracownika jest wymagany";
    } else if (!["physiotherapist", "personal_trainer"].includes(data.employeeType)) {
      errors.employeeType = "Nieprawidłowy typ pracownika";
    }

    if (!data.locations || data.locations.length === 0) {
      errors.locations = "Wybierz co najmniej jedną lokalizację";
    }

    // Validate hourly rates for selected locations
    for (const locationId of data.locations) {
      const rate = data.hourlyRates[locationId];
      if (!rate || rate <= 0) {
        errors.hourlyRate = "Wszystkie stawki godzinowe muszą być większe od 0";
        break;
      }
    }

    return errors;
  }

  /**
   * Validate employee update
   */
  validateEmployeeUpdate(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    employeeType?: string;
    locations?: string[];
    hourlyRates?: Record<string, number>;
  }) {
    const errors: Record<string, string> = {};

    if (data.firstName !== undefined) {
      if (!data.firstName?.trim()) {
        errors.firstName = "Imię jest wymagane";
      } else if (data.firstName.trim().length < 2) {
        errors.firstName = "Imię musi mieć co najmniej 2 znaki";
      }
    }

    if (data.lastName !== undefined) {
      if (!data.lastName?.trim()) {
        errors.lastName = "Nazwisko jest wymagane";
      } else if (data.lastName.trim().length < 2) {
        errors.lastName = "Nazwisko musi mieć co najmniej 2 znaki";
      }
    }

    if (data.phone !== undefined && data.phone.trim() !== "") {
      const phoneRegex = /^\+?[\d\s\-\(\)]{9,}$/;
      if (!phoneRegex.test(data.phone.trim())) {
        errors.phone = "Nieprawidłowy format numeru telefonu";
      }
    }

    if (data.employeeType !== undefined) {
      if (!["physiotherapist", "personal_trainer"].includes(data.employeeType)) {
        errors.employeeType = "Nieprawidłowy typ pracownika";
      }
    }

    if (data.locations !== undefined) {
      if (data.locations.length === 0) {
        errors.locations = "Wybierz co najmniej jedną lokalizację";
      }

      // Validate hourly rates for selected locations
      if (data.hourlyRates) {
        for (const locationId of data.locations) {
          const rate = data.hourlyRates[locationId];
          if (!rate || rate <= 0) {
            errors.hourlyRate = "Wszystkie stawki godzinowe muszą być większe od 0";
            break;
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate location assignment
   */
  validateLocationAssignment(data: {
    employeeId: string;
    locationId: string;
    hourlyRate: number;
  }) {
    const errors: Record<string, string> = {};

    if (!data.employeeId?.trim()) {
      errors.employeeId = "ID pracownika jest wymagane";
    }

    if (!data.locationId?.trim()) {
      errors.locationId = "ID lokalizacji jest wymagane";
    }

    if (!data.hourlyRate || data.hourlyRate <= 0) {
      errors.hourlyRate = "Stawka godzinowa musi być większa od 0";
    }

    return errors;
  }
}
