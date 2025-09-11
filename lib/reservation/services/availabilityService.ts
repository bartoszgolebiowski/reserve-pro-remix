import type { Database } from "~/db";
import type { AvailabilitySlot } from "~/lib/types";
import { getReservationsForRoom } from "../repos/getReservationsForRoom";

export async function getOccupiedSlotsForRoom(
  db: Database,
  roomId: string,
  date: Date,
  windowHours = 24
): Promise<AvailabilitySlot[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setHours(windowHours, 0, 0, 0);
  
  return getReservationsForRoom(db, roomId, start, end);
}
