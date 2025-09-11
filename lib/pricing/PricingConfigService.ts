/**
 * Business service for pricing configuration management
 */
import type { EmployeesRepository } from "../reservation/repos/employees.repo";
import type { PricingConfigRepository } from "./PricingConfigRepository";
import type {
    PriceBreakdown,
    PricePreviewRequest,
    PricePreviewResult,
    PricingConfigDTO,
    PricingConfigFormData,
    PricingConfigValidationResult,
    ValidationError
} from "./types";

export class PricingConfigService {
  constructor(
    private pricingConfigRepo: PricingConfigRepository,
    private employeesRepo: EmployeesRepository
  ) {}

  /**
   * Get pricing configuration for owner
   */
  async getForOwner(ownerId: string): Promise<PricingConfigDTO> {
    const config = await this.pricingConfigRepo.findByOwner(ownerId);
    
    if (!config) {
      // Return default configuration
      const defaultConfig = this.pricingConfigRepo.getDefaultConfig(ownerId);
      return await this.pricingConfigRepo.upsertByOwner(ownerId, defaultConfig);
    }

    return config;
  }

  /**
   * Save pricing configuration for owner with validation
   */
  async saveForOwner(
    ownerId: string, 
    data: PricingConfigFormData
  ): Promise<{ success: boolean; errors?: ValidationError[]; config?: PricingConfigDTO }> {
    const validation = this.validateConfig(data);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    try {
      const config = await this.pricingConfigRepo.upsertByOwner(ownerId, data);
      return { success: true, config };
    } catch (error) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Failed to save configuration' }] 
      };
    }
  }

  /**
   * Preview price calculation for given context
   */
  async previewPrice(ownerId: string, request: PricePreviewRequest): Promise<PricePreviewResult> {
    try {
      const config = await this.getForOwner(ownerId);
      const breakdown = await this.calculateSlotPrice(config, request);
      
      return { success: true, breakdown };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate price' 
      };
    }
  }

  /**
   * Calculate final price for a reservation slot with detailed breakdown
   */
  async calculateSlotPrice(
    config: PricingConfigDTO, 
    request: PricePreviewRequest
  ): Promise<PriceBreakdown> {
    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Get base rate from config
    let baseRate = this.getBaseRateForService(config, request.serviceType);

    // Get employee rate if specified
    let employeeRate: number | undefined;
    if (request.employeeId) {
      const employee = await this.employeesRepo.getEmployeeWithRateByLocation(
        request.employeeId, 
        request.locationId
      );
      if (employee?.hourlyRate && employee.hourlyRate > 0) {
        employeeRate = employee.hourlyRate;
      }
    }

    // Use employee rate if available, otherwise use base rate
    const finalBaseRate = employeeRate || baseRate;

    // Check if it's dead hour
    const isDeadHour = this.isDeadHour(startTime, config);
    
    // Calculate time multiplier (weekday/weekend)
    const timeMultiplier = this.getTimeMultiplier(startTime, config);

    // Calculate discount
    let discountAmount = 0;
    let deadHourDiscount: number | undefined;
    if (isDeadHour) {
      deadHourDiscount = config.deadHourDiscount;
      discountAmount = finalBaseRate * durationHours * timeMultiplier * deadHourDiscount;
    }

    // Calculate final price
    const basePrice = finalBaseRate * durationHours * timeMultiplier;
    const finalPrice = basePrice - discountAmount;

    return {
      baseRate,
      employeeRate,
      finalBaseRate,
      isDeadHour,
      deadHourDiscount,
      timeMultiplier,
      discountAmount,
      finalPrice,
    };
  }

  /**
   * Validate pricing configuration
   */
  private validateConfig(data: PricingConfigFormData): PricingConfigValidationResult {
    const errors: ValidationError[] = [];

    // Validate dead hours (0-23)
    if (data.deadHoursStart < 0 || data.deadHoursStart > 23) {
      errors.push({ field: 'deadHoursStart', message: 'Must be between 0 and 23' });
    }

    if (data.deadHoursEnd < 0 || data.deadHoursEnd > 23) {
      errors.push({ field: 'deadHoursEnd', message: 'Must be between 0 and 23' });
    }

    // Validate discount (0-1)
    if (data.deadHourDiscount < 0 || data.deadHourDiscount > 1) {
      errors.push({ field: 'deadHourDiscount', message: 'Must be between 0 and 1 (0% to 100%)' });
    }

    // Validate base rates (>= 0)
    if (data.baseRatePhysiotherapy < 0) {
      errors.push({ field: 'baseRatePhysiotherapy', message: 'Must be 0 or greater' });
    }

    if (data.baseRatePersonalTraining < 0) {
      errors.push({ field: 'baseRatePersonalTraining', message: 'Must be 0 or greater' });
    }

    if (data.baseRateOther < 0) {
      errors.push({ field: 'baseRateOther', message: 'Must be 0 or greater' });
    }

    // Validate multipliers (> 0)
    if (data.weekdayMultiplier <= 0) {
      errors.push({ field: 'weekdayMultiplier', message: 'Must be greater than 0' });
    }

    if (data.weekendMultiplier <= 0) {
      errors.push({ field: 'weekendMultiplier', message: 'Must be greater than 0' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get base rate for service type
   */
  private getBaseRateForService(config: PricingConfigDTO, serviceType: string): number {
    switch (serviceType) {
      case "physiotherapy":
        return config.baseRatePhysiotherapy;
      case "personal_training":
        return config.baseRatePersonalTraining;
      case "other":
        return config.baseRateOther;
      default:
        return config.baseRateOther;
    }
  }

  /**
   * Check if given time falls into dead hours
   */
  private isDeadHour(date: Date, config: PricingConfigDTO): boolean {
    const hour = date.getHours();
    
    // Handle case where dead hours span across midnight
    if (config.deadHoursStart <= config.deadHoursEnd) {
      return hour >= config.deadHoursStart && hour < config.deadHoursEnd;
    } else {
      // Dead hours cross midnight (e.g., 22:00 to 06:00)
      return hour >= config.deadHoursStart || hour < config.deadHoursEnd;
    }
  }

  /**
   * Get time multiplier for weekday/weekend
   */
  private getTimeMultiplier(date: Date, config: PricingConfigDTO): number {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return (dayOfWeek === 0 || dayOfWeek === 6) ? config.weekendMultiplier : config.weekdayMultiplier;
  }
}
