import type { PricingConfigFormData } from "~/lib/types";
import type { PricingRepository } from "../repos/pricing.repo";

export class PricingService {
  constructor(
    private pricingRepo: PricingRepository,
  ) {}

  /**
   * Pobiera konfigurację cennika dla właściciela
   * @param ownerId - ID właściciela
   * @returns Konfiguracja cennika
   */
  async getPricingForOwner(ownerId: string){
    return this.pricingRepo.getPricingConfigByOwnerId(ownerId);
  }

  /**
   * Pobiera konfigurację cennika dla właściciela lub domyślną jeśli nie istnieje
   * @param ownerId - ID właściciela
   * @returns Konfiguracja cennika
   */
  async getPricingOrDefault(ownerId: string) {
    const config = await this.pricingRepo.getPricingConfigByOwnerId(ownerId);
    
    if (config) {
      return {
        deadHoursStart: config.deadHoursStart,
        deadHoursEnd: config.deadHoursEnd,
        deadHourDiscount: config.deadHourDiscount,
        baseRatePhysiotherapy: config.baseRatePhysiotherapy,
        baseRatePersonalTraining: config.baseRatePersonalTraining,
        baseRateOther: config.baseRateOther,
        weekdayMultiplier: config.weekdayMultiplier,
        weekendMultiplier: config.weekendMultiplier,
      };
    }
    
    return this.pricingRepo.getDefaultPricingConfig();
  }

  /**
   * Aktualizuje konfigurację cennika
   * @param ownerId - ID właściciela
   * @param data - Dane konfiguracji
   * @returns Zaktualizowana konfiguracja
   */
  async updatePricingConfig(
    ownerId: string,
    data: PricingConfigFormData
  ) {
    // Walidacja danych
    this.validatePricingConfig(data);
    
    return this.pricingRepo.createOrUpdatePricingConfig(ownerId, data);
  }

  /**
   * Waliduje dane konfiguracji cennika
   * @param data - Dane do walidacji
   * @throws Error jeśli dane są nieprawidłowe
   */
  private validatePricingConfig(data: PricingConfigFormData) {
    // Sprawdzenie czy zniżka jest w zakresie 0-1
    if (data.deadHourDiscount < 0 || data.deadHourDiscount > 1) {
      throw new Error("Zniżka musi być wartością między 0 a 1");
    }

    // Sprawdzenie czy godziny martwych godzin są w zakresie 0-24
    if (
      data.deadHoursStart < 0 ||
      data.deadHoursStart > 24 ||
      data.deadHoursEnd < 0 ||
      data.deadHoursEnd > 24
    ) {
      throw new Error("Godziny muszą być w zakresie 0-24");
    }

    // Sprawdzenie czy początek jest przed końcem
    if (data.deadHoursStart >= data.deadHoursEnd) {
      throw new Error("Początek martwych godzin musi być przed końcem");
    }

    // Sprawdzenie czy stawki są dodatnie
    if (
      data.baseRatePhysiotherapy <= 0 ||
      data.baseRatePersonalTraining <= 0 ||
      data.baseRateOther <= 0
    ) {
      throw new Error("Stawki bazowe muszą być większe od zera");
    }

    // Sprawdzenie czy mnożniki są dodatnie
    if (data.weekdayMultiplier <= 0 || data.weekendMultiplier <= 0) {
      throw new Error("Mnożniki muszą być większe od zera");
    }
  }
}
