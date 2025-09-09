/**
 * Simplified logout service
 */
import { redirect } from "@remix-run/node";
import { SessionService } from "./session.service";

export class LogoutService {
  constructor(private sessionService: SessionService) {}

  /**
   * Logout user - revoke session and clear cookie
   */
  async logoutUser(request: Request): Promise<Response> {
    try {
      // Get session token from cookie
      const sessionToken = await this.sessionService.getSessionTokenFromCookie(request);

      if (sessionToken) {
        // Revoke session in database
        await this.sessionService.revokeSession(sessionToken);
      }

      // Clear cookie and redirect
      const responseInit = await this.sessionService.clearSessionCookie();
      return redirect("/auth/login", responseInit);
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even on error, try to clear cookie
      const responseInit = await this.sessionService.clearSessionCookie();
      return redirect("/auth/login", responseInit);
    }
  }
}
