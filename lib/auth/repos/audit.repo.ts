/**
 * Repozytorium audytu - dostęp do tabeli audit_logs
 */
import { type DrizzleDatabase } from "~/db/index";
import { auditLogs } from "~/db/schema/auth";

export type CreateAuditLogData = {
  userId?: string;
  action: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
};

/**
 * Klasa repozytorium audytu
 */
export class AuditRepository {
  private db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  /**
   * Stwórz nowy log audytu
   */
  async createAuditLog(data: CreateAuditLogData) {
    const result = await this.db
      .insert(auditLogs)
      .values({
        userId: data.userId,
        action: data.action,
        details: data.details || {},
        ip: data.ip,
        userAgent: data.userAgent,
      })
      .returning();

    return result[0];
  }
}
