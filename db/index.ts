import { drizzle } from "drizzle-orm/libsql";
import { env } from "~/lib/env";
import * as schema from "./schema";

export const createDatabaseTurso = (url: string, authToken: string) =>
  drizzle({
    connection: {
      url,
      authToken,
    },
    schema,
  });

export const createDatabaseSQLite = (url: string) =>
  drizzle({ 
    connection: { url },
    schema,
  });

// export const db = createDatabaseTurso(
//   env.TURSO_CONNECTION_URL,
//   env.TURSO_AUTH_TOKEN
// );

export const db = createDatabaseSQLite(env.DB_FILE_NAME);
export type DrizzleDatabase = typeof db;

// Export all schemas for convenience
export * from "./schema";

