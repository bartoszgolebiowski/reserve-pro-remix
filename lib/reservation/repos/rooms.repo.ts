/**
 * Repository for rooms management
 */
import { and, eq } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../db";
import { locations, rooms } from "../../../db/schema/reservations";
import type { RoomFormData } from "../../types";

export class RoomsRepository {
  constructor(private db: DrizzleDatabase) {}

  /**
   * Get all rooms for a specific location
   */
  async getRoomsByLocationId(locationId: string) {
    const result = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.locationId, locationId))
      .orderBy(rooms.createdAt);

    return result.map((room) => ({
      ...room,
      serviceTypes: JSON.parse(room.serviceTypes),
      equipment: JSON.parse(room.equipment || "[]"),
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString(),
    }));
  }

  /**
   * Get a single room by ID (with location ownership verification)
   */
  async getRoomById(roomId: string, ownerId: string) {
    const result = await this.db
      .select({
        room: rooms,
        location: locations,
      })
      .from(rooms)
      .innerJoin(locations, eq(rooms.locationId, locations.id))
      .where(and(eq(rooms.id, roomId), eq(locations.ownerId, ownerId)))
      .limit(1);

    if (!result[0]) return null;

    const { room } = result[0];
    return {
      ...room,
      serviceTypes: JSON.parse(room.serviceTypes),
      equipment: JSON.parse(room.equipment || "[]"),
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Create a new room
   */
  async createRoom(locationId: string, ownerId: string, data: RoomFormData) {
    // First verify that the location belongs to the owner
    const locationResult = await this.db
      .select()
      .from(locations)
      .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
      .limit(1);

    if (!locationResult[0]) return null;

    const result = await this.db
      .insert(rooms)
      .values({
        ...data,
        locationId,
        serviceTypes: JSON.stringify(data.serviceTypes),
        equipment: JSON.stringify(data.equipment),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const room = result[0];
    return {
      ...room,
      serviceTypes: JSON.parse(room.serviceTypes),
      equipment: JSON.parse(room.equipment || "[]"),
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Update an existing room
   */
  async updateRoom(roomId: string, ownerId: string, data: RoomFormData) {
    // First verify ownership through location
    const ownershipCheck = await this.db
      .select({ roomId: rooms.id })
      .from(rooms)
      .innerJoin(locations, eq(rooms.locationId, locations.id))
      .where(and(eq(rooms.id, roomId), eq(locations.ownerId, ownerId)))
      .limit(1);

    if (!ownershipCheck[0]) return null;

    const result = await this.db
      .update(rooms)
      .set({
        ...data,
        serviceTypes: JSON.stringify(data.serviceTypes),
        equipment: JSON.stringify(data.equipment),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(rooms.id, roomId))
      .returning();

    if (!result[0]) return null;

    const room = result[0];
    return {
      ...room,
      serviceTypes: JSON.parse(room.serviceTypes),
      equipment: JSON.parse(room.equipment || "[]"),
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Delete a room
   */
  async deleteRoom(roomId: string, ownerId: string) {
    // First verify ownership through location
    const ownershipCheck = await this.db
      .select({ roomId: rooms.id })
      .from(rooms)
      .innerJoin(locations, eq(rooms.locationId, locations.id))
      .where(and(eq(rooms.id, roomId), eq(locations.ownerId, ownerId)))
      .limit(1);

    if (!ownershipCheck[0]) return false;

    const result = await this.db
      .delete(rooms)
      .where(eq(rooms.id, roomId))
      .returning();

    return result.length > 0;
  }
}
