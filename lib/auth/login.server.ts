/**
 * Simplified login service
 */
import type { LoginFormData } from "../types";
import type { UsersRepository } from "./repos/users.repo";
import { SecurityService } from "./security.server";
import { SessionService } from "./session.service";
import { AuthValidators } from "./validators.server";

export class LoginService {
  constructor(
    private usersRepo: UsersRepository,
    private authValidators: AuthValidators,
    private securityService: SecurityService,
    private sessionService: SessionService
  ) {}

  /**
   * Login user
   */
  async loginUser(formData: LoginFormData) {
    // Validate form data
    const errors = this.authValidators.validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    try {
      const normalizedEmail = formData.email.toLowerCase().trim();
      const user = await this.usersRepo.findUserByEmail(normalizedEmail);

      if (!user) {
        // Perform dummy operation to prevent timing attacks
        await this.securityService.verifyPassword(
          "dummy-password",
          "dummy-hash"
        );

        return {
          success: false,
          errors: {
            _form: "Invalid email or password",
          },
        };
      }

      // Verify password
      const isPasswordValid = await this.securityService.verifyPassword(
        formData.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          errors: {
            _form: "Invalid email or password",
          },
        };
      }

      // Create session
      const sessionToken = await this.sessionService.createSession(user.id);

      // Set cookie
      const responseInit =
        await this.sessionService.setSessionCookie(sessionToken);

      return {
        success: true,
        user: {
          ...user,
          passwordHash: undefined,
        },
        message: "Login successful",
        responseInit,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        errors: {
          _form: "An error occurred during login. Please try again later.",
        },
      };
    }
  }
}
