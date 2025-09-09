/**
 * Moduł zabezpieczeń - hashowanie haseł, generowanie tokenów
 */
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

export class SecurityService {
  /**
   * Hashowanie hasła używając Node.js crypto.scrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = randomBytes(32);
      const keylen = 64;
      const scryptAsync = promisify(scrypt);

      const derivedKey = (await scryptAsync(password, salt, keylen)) as Buffer;

      // Format: algorithm:salt:hash
      return `scrypt:${salt.toString("base64")}:${derivedKey.toString("base64")}`;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Failed to hash password");
    }
  }

  /**
   * Weryfikacja hasła z hashem używając Node.js crypto.scrypt
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const parts = hash.split(":");
      if (parts.length !== 3 || parts[0] !== "scrypt") {
        return false;
      }

      const salt = Buffer.from(parts[1], "base64");
      const storedHash = Buffer.from(parts[2], "base64");
      const keylen = 64;
      const scryptAsync = promisify(scrypt);

      const derivedKey = (await scryptAsync(password, salt, keylen)) as Buffer;

      return timingSafeEqual(derivedKey, storedHash);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }
}
