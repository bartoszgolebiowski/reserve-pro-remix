/**
 * Simplified cookie-based session service
 */
import { randomBytes } from "crypto";
import { COOKIE_CONFIG } from "./config/cookies.config";
import type { SessionsRepository } from "./repos/sessions.repo";

export type SessionInfo = {
  user: any;
  sessionId: string;
};

export class SessionService {
  constructor(private sessionsRepo: SessionsRepository) {}

  /**
   * Create a new session
   */
  async createSession(userId: string): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = this.calculateExpiryDate();

    await this.sessionsRepo.createSession({
      userId,
      sessionToken,
      expiresAt,
    });

    return sessionToken;
  }

  /**
   * Get session with user data
   */
  async getSession(request: Request): Promise<SessionInfo | null> {
    const sessionToken = await this.getSessionTokenFromCookie(request);

    if (!sessionToken) {
      return null;
    }

    const sessionWithUser = await this.sessionsRepo.findSessionWithUserByToken(sessionToken);

    if (!sessionWithUser) {
      return null;
    }

    // Check if session is expired
    if (this.isSessionExpired(sessionWithUser)) {
      await this.sessionsRepo.deleteSession(sessionWithUser.id);
      return null;
    }

    return {
      user: sessionWithUser.user,
      sessionId: sessionWithUser.id,
    };
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionToken: string): Promise<void> {
    const session = await this.sessionsRepo.findSessionByToken(sessionToken);
    if (session) {
      await this.sessionsRepo.deleteSession(session.id);
    }
  }

  /**
   * Set session cookie
   */
  async setSessionCookie(sessionToken: string): Promise<ResponseInit> {
    const cookieValue = `${COOKIE_CONFIG.name}=${sessionToken}; Path=${COOKIE_CONFIG.path}; Max-Age=${Math.floor(COOKIE_CONFIG.maxAge / 1000)}; HttpOnly; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? "; Secure" : ""}`;

    return {
      headers: {
        "Set-Cookie": cookieValue,
      },
    };
  }

  /**
   * Clear session cookie
   */
  async clearSessionCookie(): Promise<ResponseInit> {
    const cookieValue = `${COOKIE_CONFIG.name}=; Path=${COOKIE_CONFIG.path}; Max-Age=0; HttpOnly; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? "; Secure" : ""}`;

    return {
      headers: {
        "Set-Cookie": cookieValue,
      },
    };
  }

  /**
   * Get session token from cookie
   */
  async getSessionTokenFromCookie(request: Request): Promise<string | null> {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const sessionCookie = cookies.find((c) =>
      c.startsWith(`${COOKIE_CONFIG.name}=`)
    );

    if (!sessionCookie) {
      return null;
    }

    return sessionCookie.split("=")[1] || null;
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    return randomBytes(32).toString("base64url");
  }

  /**
   * Calculate session expiry date (30 days)
   */
  private calculateExpiryDate(): string {
    return new Date(Date.now() + COOKIE_CONFIG.maxAge).toISOString();
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: { expiresAt: string }): boolean {
    return new Date(session.expiresAt) <= new Date();
  }
}
