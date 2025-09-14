export interface Reservation {
  id: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  status: "confirmed" | "completed" | "cancelled";
  finalPrice: number;
  isDeadHour?: boolean;
  notes?: string;
  locationId?: string;
  roomId?: string;
  roomName?: string;
  employeeId: string;
  basePrice?: number;
}
