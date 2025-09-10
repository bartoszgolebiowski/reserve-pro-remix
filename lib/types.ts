/**
 * Shared types for the application
 */

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  firstName: string;
  lastName: string;
};

// Location types
export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type LocationFormData = {
  name: string;
  address: string;
  city: string;
};

export type LocationWithRoomCount = Location & {
  roomCount: number;
};

// Room types
export type Room = {
  id: string;
  name: string;
  locationId: string;
  serviceTypes: string[];
  capacity: number;
  equipment: string[];
  createdAt: string;
  updatedAt: string;
};

export type RoomFormData = {
  name: string;
  serviceTypes: string[];
  capacity: number;
  equipment: string[];
};

// Employee types
export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeType: "physiotherapist" | "personal_trainer";
  createdAt: string | null;
  updatedAt: string | null;
};

export type EmployeeLocation = {
  id: string;
  employeeId: string;
  locationId: string;
  hourlyRate: number;
  createdAt: string;
};

// Reservation types
export type Reservation = {
  id: string;
  employeeId: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  startTime: Date;
  endTime: Date;
  basePrice: number;
  finalPrice: number;
  isDeadHour: boolean;
  status: "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReservationFormData = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  startTime: Date;
  endTime: Date;
  employeeId: string;
  roomId: string;
};

// Pricing configuration types
export type PricingConfig = {
  id: string;
  ownerId: string;
  deadHoursStart: number;
  deadHoursEnd: number;
  deadHourDiscount: number;
  baseRatePhysiotherapy: number;
  baseRatePersonalTraining: number;
  baseRateOther: number;
  weekdayMultiplier: number;
  weekendMultiplier: number;
  createdAt: string;
  updatedAt: string;
};

export type PricingConfigFormData = {
  deadHoursStart: number;
  deadHoursEnd: number;
  deadHourDiscount: number;
  baseRatePhysiotherapy: number;
  baseRatePersonalTraining: number;
  baseRateOther: number;
  weekdayMultiplier: number;
  weekendMultiplier: number;
};
