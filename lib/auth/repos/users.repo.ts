/**
 * Repozytorium użytkowników - dostęp do tabeli users
 */
import { eq } from "drizzle-orm";
import { type DrizzleDatabase } from "~/db/index";
import { users } from "~/db/schema/auth";

export type UserRole = "OWNER" | "WORKER";
export type UserStatus = "pending" | "active" | "blocked";

export type CreateUserData = {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
};

export type UpdateUserData = Partial<{
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}>;

/**
 * Klasa repozytorium użytkowników
 */
export class UsersRepository {
  private db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  /**
   * Znajdź użytkownika po adresie e-mail (znormalizowanym)
   */
  async findUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Znajdź użytkownika po id
   */
  async findUserById(id: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Stwórz nowego użytkownika
   */
  async createUser(data: CreateUserData) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const result = await this.db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .returning();

    return result[0];
  }

  /**
   * Aktualizuj użytkownika
   */
  async updateUser(id: string, data: UpdateUserData) {
    // Normalize date fields to ISO strings for SQLite
    const payload: Partial<UpdateUserData> & { updatedAt: string } = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.db
      .update(users)
      .set(payload)
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }

  /**
   * Sprawdź czy adres e-mail jest już zajęty
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.findUserByEmail(normalizedEmail);
    return !!user;
  }

  /**
   * Usuń użytkownika (soft delete)
   */
  async deleteUser(id: string) {
    const result = await this.db
      .update(users)
      .set({
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }
}
