/**
 * Typy pomocnicze dla systemu rezerwacji
 */

// Enums jako TypeScript types dla lepszej kompatybilności
export type UserRole = "owner" | "employee" | "client";
export type EmployeeType = "physiotherapist" | "personal_trainer";  
export type ServiceType = "physiotherapy" | "personal_training" | "other";
export type ReservationStatus = "confirmed" | "cancelled" | "completed";

// Helper types for working with JSON fields in SQLite
export type ServiceTypeArray = ServiceType[];
export type EquipmentArray = string[];

// Insert types (without generated fields like id, timestamps)
export type NewProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
};

export type NewLocation = {
  name: string;
  address: string;
  city: string;
  ownerId: string;
};

export type NewRoom = {
  name: string;
  locationId: string;
  serviceTypes?: string; // JSON string
  capacity?: number;
  equipment?: string; // JSON string
};

export type NewEmployee = {
  id: string;
  employeeType: EmployeeType;
};

export type NewEmployeeLocation = {
  employeeId: string;
  locationId: string;
  hourlyRate?: number;
};

export type NewReservation = {
  employeeId: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: ServiceType;
  startTime: string; // ISO string
  endTime: string; // ISO string
  basePrice: number;
  finalPrice: number;
  isDeadHour?: boolean;
  status?: ReservationStatus;
  notes?: string;
};

export type NewPricingConfig = {
  ownerId: string;
  deadHoursStart?: number;
  deadHoursEnd?: number;
  deadHourDiscount?: number;
  baseRatePhysiotherapy?: number;
  baseRatePersonalTraining?: number;
  baseRateOther?: number;
  weekdayMultiplier?: number;
  weekendMultiplier?: number;
};

// Helper functions for JSON fields
export const parseServiceTypes = (serviceTypesJson: string): ServiceTypeArray => {
  try {
    return JSON.parse(serviceTypesJson) as ServiceTypeArray;
  } catch {
    return [];
  }
};

export const stringifyServiceTypes = (serviceTypes: ServiceTypeArray): string => {
  return JSON.stringify(serviceTypes);
};

export const parseEquipment = (equipmentJson: string): EquipmentArray => {
  try {
    return JSON.parse(equipmentJson) as EquipmentArray;
  } catch {
    return [];
  }
};

export const stringifyEquipment = (equipment: EquipmentArray): string => {
  return JSON.stringify(equipment);
};
