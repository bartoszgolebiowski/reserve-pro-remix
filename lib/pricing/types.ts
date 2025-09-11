/**
 * Types and DTOs for pricing configuration management
 */

export interface PricingConfigDTO {
  id: string;
  ownerId: string;
  deadHoursStart: number; // 0-23
  deadHoursEnd: number; // 0-23
  deadHourDiscount: number; // 0-1 (0.2 = 20% discount)
  baseRatePhysiotherapy: number;
  baseRatePersonalTraining: number;
  baseRateOther: number;
  weekdayMultiplier: number; // > 0
  weekendMultiplier: number; // > 0
  createdAt: string;
  updatedAt: string;
}

export interface PricingConfigFormData {
  deadHoursStart: number;
  deadHoursEnd: number;
  deadHourDiscount: number;
  baseRatePhysiotherapy: number;
  baseRatePersonalTraining: number;
  baseRateOther: number;
  weekdayMultiplier: number;
  weekendMultiplier: number;
}

export interface PricePreviewRequest {
  serviceType: "physiotherapy" | "personal_training" | "other";
  locationId: string;
  employeeId?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface PriceBreakdown {
  baseRate: number;
  employeeRate?: number;
  finalBaseRate: number; // baseRate or employeeRate if available
  isDeadHour: boolean;
  deadHourDiscount?: number;
  timeMultiplier: number; // weekday/weekend
  discountAmount: number;
  finalPrice: number;
}

export interface PricePreviewResult {
  success: boolean;
  error?: string;
  breakdown?: PriceBreakdown;
}

export interface OccupancyFilter {
  locationId?: string;
  serviceType?: "physiotherapy" | "personal_training" | "other";
  employeeId?: string;
  roomId?: string;
  dateFrom: string; // ISO string
  dateTo: string; // ISO string
}

export interface OccupancySlot {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: string;
  roomId: string;
  roomName: string;
  locationId: string;
  locationName: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  startTime: string;
  endTime: string;
  clientName: string;
  status: "confirmed" | "cancelled" | "completed";
  finalPrice: number;
  isDeadHour: boolean;
}

export interface OccupancyStats {
  totalSlots: number;
  confirmedSlots: number;
  totalRevenue: number;
  deadHourSlots: number;
  deadHourRevenue: number;
  occupancyRate: number; // 0-1
}

export interface OccupancyResult {
  slots: OccupancySlot[];
  stats: OccupancyStats;
  filters: OccupancyFilter;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface PricingConfigValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
