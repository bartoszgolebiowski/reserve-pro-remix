import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
/**
 * Schema for environment variables
 */
const envSchema = z.object({
  // Database configuration
  DB_FILE_NAME: z.string().min(1),
  
  // Auth configuration
  SESSION_SECRET: z.string().min(20).default('change-this-in-production-this-is-a-very-long-secret'),
  REFRESH_TOKEN_SECRET: z.string().min(20).default('change-this-refresh-token-secret-in-production'),
  ACCESS_TOKEN_SECRET: z.string().min(20).default('change-this-access-token-secret-in-production'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  
  // Security settings
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  ACCOUNT_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
  PASSWORD_MIN_LENGTH: z.coerce.number().int().positive().default(8),
  
  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Parse and validate environment variables
 * This will throw an error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((issue) => issue.code === "invalid_type")
        .map((issue) => issue.path.join("."));

      console.error("❌ Missing environment variables:");
      missingVars.forEach((variable) => {
        console.error(`   - ${variable}`);
      });

      console.error(
        "\nPlease check your .env file and ensure all required variables are set."
      );
    }

    throw new Error("Invalid environment variables");
  }
}

/**
 * Validated environment variables
 */
export const env = validateEnv();

/**
 * Type definition for the env object
 */
export type Env = z.infer<typeof envSchema>;
