/**
 * Schema bazy danych dla systemu uwierzytelniania
 */
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

// Simplified users table
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["OWNER", "WORKER"] })
    .notNull()
    .default("WORKER"),
  status: text("status", { enum: ["pending", "active", "blocked"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// Simplified sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
});

// Relations
relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

relations(users, ({ many }) => ({
  sessions: many(sessions),
}));
