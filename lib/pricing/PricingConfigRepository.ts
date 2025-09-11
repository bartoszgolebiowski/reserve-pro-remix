/**
 * Repository for pricing configuration management
 */
import { eq } from "drizzle-orm";
import { type DrizzleDatabase } from "~/db/index";
import { pricingConfig } from "~/db/schema/reservations";
import type { PricingConfigDTO, PricingConfigFormData } from "./types";

export class PricingConfigRepository {
  constructor(private db: DrizzleDatabase) {}

  /**
   * Find pricing configuration by owner ID
   */
  async findByOwner(ownerId: string): Promise<PricingConfigDTO | null> {
    const rows = await this.db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.ownerId, ownerId))
      .limit(1);

    const row = rows[0];
    return row ? this.mapDbRowToDTO(row) : null;
  }

  /**
   * Upsert pricing configuration for owner
   * Creates new record if doesn't exist, updates if exists
   */
  async upsertByOwner(
    ownerId: string,
    data: PricingConfigFormData
  ): Promise<PricingConfigDTO> {
    const existing = await this.findByOwner(ownerId);
    const now = new Date().toISOString();

    if (existing) {
      // Update existing record
      const result = await this.db
        .update(pricingConfig)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(pricingConfig.ownerId, ownerId))
        .returning();

      return this.mapDbRowToDTO(result[0]);
    } else {
      // Create new record
      const result = await this.db
        .insert(pricingConfig)
        .values({
          ownerId,
          ...data,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return this.mapDbRowToDTO(result[0]);
    }
  }

  /**
   * Get default pricing configuration for owner
   * Used when no configuration exists yet
   */
  getDefaultConfig(ownerId: string): PricingConfigFormData {
    return {
      deadHoursStart: 8,
      deadHoursEnd: 16,
      deadHourDiscount: 0.2, // 20%
      baseRatePhysiotherapy: 150,
      baseRatePersonalTraining: 120,
      baseRateOther: 100,
      weekdayMultiplier: 1.0,
      weekendMultiplier: 1.2,
    };
  }

  /**
   * Map database row to DTO
   */
  private mapDbRowToDTO(row: typeof pricingConfig.$inferSelect): PricingConfigDTO {
    return {
      id: row.id,
      ownerId: row.ownerId,
      deadHoursStart: row.deadHoursStart,
      deadHoursEnd: row.deadHoursEnd,
      deadHourDiscount: row.deadHourDiscount,
      baseRatePhysiotherapy: row.baseRatePhysiotherapy,
      baseRatePersonalTraining: row.baseRatePersonalTraining,
      baseRateOther: row.baseRateOther,
      weekdayMultiplier: row.weekdayMultiplier,
      weekendMultiplier: row.weekendMultiplier,
      createdAt: row.createdAt || new Date().toISOString(),
      updatedAt: row.updatedAt || new Date().toISOString(),
    };
  }
}
