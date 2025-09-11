import { and, eq, gt, lt } from "drizzle-orm";
import type { Database } from "~/db";
import { reservations } from "~/db/schema/reservations";
import type { AvailabilitySlot } from "~/lib/types";

export async function getReservationsForRoom(
  db: Database,
  roomId: string,
  start: Date,
  end: Date
): Promise<AvailabilitySlot[]> {
  const rows = await db
    .select({
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      employeeId: reservations.employeeId,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.roomId, roomId),
        lt(reservations.startTime, end.toISOString()),
        gt(reservations.endTime, start.toISOString())
      )
    );

  return rows.map((row) => ({
    startTime: row.startTime,
    endTime: row.endTime,
    employeeId: row.employeeId,
    isAvailable: false,
  }));
}
