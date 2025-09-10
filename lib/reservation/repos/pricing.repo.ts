import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "~/db/index";
import { pricingConfig } from "~/db/schema/reservations";
import type { PricingConfigFormData } from "~/lib/types";

export class PricingRepository {
  constructor(private db: DrizzleDatabase) {}

  /**
   * Pobiera konfigurację cennika dla właściciela
   * @param ownerId - ID właściciela
   * @returns Konfiguracja cennika
   */
  async getPricingConfigByOwnerId(ownerId: string) {
    const results = await this.db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.ownerId, ownerId));

    return results[0] || null;
  }

  /**
   * Tworzy lub aktualizuje konfigurację cennika
   * @param ownerId - ID właściciela
   * @param data - Dane konfiguracji
   * @returns Zaktualizowana konfiguracja
   */
  async createOrUpdatePricingConfig(
    ownerId: string,
    data: PricingConfigFormData
  ) {
    // Sprawdź czy konfiguracja już istnieje
    const existingConfig = await this.getPricingConfigByOwnerId(ownerId);

    if (existingConfig) {
      // Aktualizuj istniejącą konfigurację
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const result = await this.db
        .update(pricingConfig)
        .set(updateData)
        .where(eq(pricingConfig.id, existingConfig.id))
        .returning();

      return result[0];
    } else {
      // Utwórz nową konfigurację
      const result = await this.db
        .insert(pricingConfig)
        .values({
          ownerId,
          deadHoursStart: data.deadHoursStart,
          deadHoursEnd: data.deadHoursEnd,
          deadHourDiscount: data.deadHourDiscount,
          baseRatePhysiotherapy: data.baseRatePhysiotherapy,
          baseRatePersonalTraining: data.baseRatePersonalTraining,
          baseRateOther: data.baseRateOther,
          weekdayMultiplier: data.weekdayMultiplier,
          weekendMultiplier: data.weekendMultiplier,
        })
        .returning();

      return result[0];
    }
  }

  /**
   * Pobiera domyślne wartości konfiguracji cennika
   * @returns Domyślna konfiguracja
   */
  getDefaultPricingConfig() {
    return {
      deadHoursStart: 8,
      deadHoursEnd: 16,
      deadHourDiscount: 0.2,
      baseRatePhysiotherapy: 150,
      baseRatePersonalTraining: 120,
      baseRateOther: 100,
      weekdayMultiplier: 1.0,
      weekendMultiplier: 1.2,
    };
  }
}
