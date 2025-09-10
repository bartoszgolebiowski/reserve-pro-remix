/**
 * Typy dla zarządzania pracownikami
 */

export type CreateEmployeeData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  employeeType: "physiotherapist" | "personal_trainer";
  locations: Array<{
    locationId: string;
    hourlyRate: number;
  }>;
};

export type UpdateEmployeeData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeType?: "physiotherapist" | "personal_trainer";
  locations?: Array<{
    locationId: string;
    hourlyRate: number;
  }>;
};

export type EmployeeWithLocations = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeType: "physiotherapist" | "personal_trainer";
  createdAt: string;
  updatedAt: string;
  locations: Array<{
    locationId: string;
    locationName: string;
    hourlyRate: number;
  }>;
};

export type EmployeeFormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  employeeType?: string;
  locations?: string;
  hourlyRate?: string;
  _form?: string;
};

export type EmployeeFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  employeeType: "physiotherapist" | "personal_trainer";
  locations: string[];
  hourlyRates: Record<string, number>;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  ownerId: string;
};
