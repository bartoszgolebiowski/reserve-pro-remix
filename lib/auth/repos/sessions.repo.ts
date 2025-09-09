/**
 * Simplified sessions repository
 */
import { eq } from "drizzle-orm";
import { type DrizzleDatabase } from "~/db/index";
import { sessions, users } from "~/db/schema/auth";

export type CreateSessionData = {
  userId: string;
  sessionToken: string;
  expiresAt: string;
};

export class SessionsRepository {
  private db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionData) {
    const result = await this.db
      .insert(sessions)
      .values({
        userId: data.userId,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
      })
      .returning();

    return result[0];
  }

  /**
   * Find session by token
   */
  async findSessionByToken(token: string) {
    const rows = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, token))
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Find session by token with user data
   */
  async findSessionWithUserByToken(token: string) {
    const rows = await this.db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.sessionToken, token))
      .limit(1);

    if (!rows[0]) return null;

    const { sessions: sessionData, users: userData } = rows[0];
    return {
      ...sessionData,
      user: userData,
    };
  }

  /**
   * Delete session by ID
   */
  async deleteSession(sessionId: string) {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}
