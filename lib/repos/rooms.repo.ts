/**
 * Repository for rooms management
 */
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { locations, rooms } from "../../db/schema/reservations";
import type { Room, RoomFormData } from "../types";

/**
 * Get all rooms for a specific location
 */
export async function getRoomsByLocationId(locationId: string): Promise<Room[]> {
  const result = await db
    .select()
    .from(rooms)
    .where(eq(rooms.locationId, locationId))
    .orderBy(rooms.createdAt);

  return result.map(room => ({
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
export async function getRoomById(roomId: string, ownerId: string): Promise<Room | null> {
  const result = await db
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
export async function createRoom(
  locationId: string, 
  ownerId: string, 
  data: RoomFormData
): Promise<Room | null> {
  // First verify that the location belongs to the owner
  const locationResult = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
    .limit(1);

  if (!locationResult[0]) return null;

  const result = await db
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
export async function updateRoom(
  roomId: string, 
  ownerId: string, 
  data: RoomFormData
): Promise<Room | null> {
  // First verify ownership through location
  const ownershipCheck = await db
    .select({ roomId: rooms.id })
    .from(rooms)
    .innerJoin(locations, eq(rooms.locationId, locations.id))
    .where(and(eq(rooms.id, roomId), eq(locations.ownerId, ownerId)))
    .limit(1);

  if (!ownershipCheck[0]) return null;

  const result = await db
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
export async function deleteRoom(roomId: string, ownerId: string): Promise<boolean> {
  // First verify ownership through location
  const ownershipCheck = await db
    .select({ roomId: rooms.id })
    .from(rooms)
    .innerJoin(locations, eq(rooms.locationId, locations.id))
    .where(and(eq(rooms.id, roomId), eq(locations.ownerId, ownerId)))
    .limit(1);

  if (!ownershipCheck[0]) return false;

  const result = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning();

  return result.length > 0;
}
