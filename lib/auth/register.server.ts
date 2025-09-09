/**
 * Simplified registration service
 */
import type { RegisterFormData } from "../types";
import type { UsersRepository } from "./repos/users.repo";
import { SecurityService } from "./security.server";
import { SessionService } from "./session.service";
import { AuthValidators } from "./validators.server";

export type RegistrationResult = {
  success: boolean;
  userId?: string;
  errors?: Record<string, string>;
  message?: string;
  responseInit?: ResponseInit;
};

export class RegistrationService {
  constructor(
    private usersRepo: UsersRepository,
    private authValidators: AuthValidators,
    private securityService: SecurityService,
    private sessionService: SessionService
  ) {}

  /**
   * Register new user and automatically log them in
   */
  async registerUser(formData: RegisterFormData): Promise<RegistrationResult> {
    // Validate form data
    const errors = this.authValidators.validateRegistrationForm(formData);
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    try {
      const normalizedEmail = formData.email.toLowerCase().trim();

      // Check if email is already taken
      const isEmailTaken = await this.usersRepo.isEmailTaken(normalizedEmail);
      if (isEmailTaken) {
        return {
          success: false,
          errors: {
            email: "This email is already registered",
          },
        };
      }

      // Hash password
      const passwordHash = await this.securityService.hashPassword(
        formData.password
      );

      // Create user
      const user = await this.usersRepo.createUser({
        email: normalizedEmail,
        passwordHash,
        role: formData.role as any,
        status: "active",
        isActive: true,
      });

      // Automatically create session for the new user
      const sessionToken = await this.sessionService.createSession(user.id);
      
      // Set cookie
      const responseInit = await this.sessionService.setSessionCookie(sessionToken);

      return {
        success: true,
        userId: user.id,
        message: "Account created successfully. You are now logged in.",
        responseInit,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        errors: {
          _form: "An error occurred during registration. Please try again later.",
        },
      };
    }
  }
}
