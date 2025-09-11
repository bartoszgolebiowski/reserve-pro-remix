/**
 * Repository for occupancy monitoring queries
 */
import { and, eq, gte, lte } from "drizzle-orm";
import { type DrizzleDatabase } from "~/db/index";
import { users } from "~/db/schema/auth";
import { employeeLocations, employees, locations, reservations, rooms } from "~/db/schema/reservations";
import type { OccupancyFilter, OccupancySlot } from "../pricing/types";

export class OccupancyRepository {
  constructor(private db: DrizzleDatabase) {}

  /**
   * Get reservations for occupancy monitoring
   */
  async getOccupancySlots(ownerId: string, filter: OccupancyFilter): Promise<OccupancySlot[]> {
    // Apply filters
    const conditions = [
      eq(locations.ownerId, ownerId),
      gte(reservations.startTime, filter.dateFrom),
      lte(reservations.endTime, filter.dateTo)
    ];

    if (filter.locationId) {
      conditions.push(eq(locations.id, filter.locationId));
    }

    if (filter.serviceType) {
      conditions.push(eq(reservations.serviceType, filter.serviceType));
    }

    if (filter.employeeId) {
      conditions.push(eq(reservations.employeeId, filter.employeeId));
    }

    if (filter.roomId) {
      conditions.push(eq(reservations.roomId, filter.roomId));
    }

    const results = await this.db
      .select({
        id: reservations.id,
        employeeId: reservations.employeeId,
        employeeFirstName: users.firstName,
        employeeLastName: users.lastName,
        employeeType: employees.employeeType,
        roomId: reservations.roomId,
        roomName: rooms.name,
        locationId: rooms.locationId,
        locationName: locations.name,
        serviceType: reservations.serviceType,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        clientName: reservations.clientName,
        status: reservations.status,
        finalPrice: reservations.finalPrice,
        isDeadHour: reservations.isDeadHour,
      })
      .from(reservations)
      .innerJoin(employees, eq(reservations.employeeId, employees.id))
      .innerJoin(users, eq(employees.id, users.id))
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .innerJoin(locations, eq(rooms.locationId, locations.id))
      .where(and(...conditions));

    return results.map(row => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeName: `${row.employeeFirstName} ${row.employeeLastName}`,
      employeeType: row.employeeType,
      roomId: row.roomId,
      roomName: row.roomName,
      locationId: row.locationId,
      locationName: row.locationName,
      serviceType: row.serviceType as "physiotherapy" | "personal_training" | "other",
      startTime: row.startTime,
      endTime: row.endTime,
      clientName: row.clientName,
      status: row.status as "confirmed" | "cancelled" | "completed",
      finalPrice: row.finalPrice,
      isDeadHour: Boolean(row.isDeadHour),
    }));
  }

  /**
   * Get locations owned by user
   */
  async getOwnerLocations(ownerId: string) {
    return await this.db
      .select()
      .from(locations)
      .where(eq(locations.ownerId, ownerId));
  }

  /**
   * Get employees for owner's locations
   */
  async getOwnerEmployees(ownerId: string) {
    return await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(employeeLocations)
      .innerJoin(locations, eq(employeeLocations.locationId, locations.id))
      .innerJoin(employees, eq(employeeLocations.employeeId, employees.id))
      .innerJoin(users, eq(employees.id, users.id))
      .where(eq(locations.ownerId, ownerId));
  }

  /**
   * Get rooms for owner's locations
   */
  async getOwnerRooms(ownerId: string) {
    return await this.db
      .select({
        id: rooms.id,
        name: rooms.name,
        locationId: rooms.locationId,
        locationName: locations.name,
        serviceTypes: rooms.serviceTypes,
      })
      .from(rooms)
      .innerJoin(locations, eq(rooms.locationId, locations.id))
      .where(eq(locations.ownerId, ownerId));
  }
}
