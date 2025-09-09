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
