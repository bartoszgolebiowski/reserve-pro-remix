/**
 * Repository for locations management
 */
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { locations, rooms } from "../../db/schema/reservations";
import type { Location, LocationFormData, LocationWithRoomCount } from "../types";

/**
 * Get all locations belonging to a specific owner
 */
export async function getLocationsByOwnerId(ownerId: string): Promise<Location[]> {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.ownerId, ownerId))
    .orderBy(locations.createdAt);

  return result.map(location => ({
    ...location,
    createdAt: location.createdAt || new Date().toISOString(),
    updatedAt: location.updatedAt || new Date().toISOString(),
  }));
}

/**
 * Get locations with room count for a specific owner
 */
export async function getLocationsWithRoomCountByOwnerId(ownerId: string): Promise<LocationWithRoomCount[]> {
  const locationsData = await getLocationsByOwnerId(ownerId);
  
  const locationsWithRoomCount = await Promise.all(
    locationsData.map(async (location) => {
      const roomsData = await db
        .select()
        .from(rooms)
        .where(eq(rooms.locationId, location.id));
      
      return {
        ...location,
        roomCount: roomsData.length
      };
    })
  );

  return locationsWithRoomCount;
}

/**
 * Get a single location by ID (with owner verification)
 */
export async function getLocationById(locationId: string, ownerId: string): Promise<Location | null> {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0],
    createdAt: result[0].createdAt || new Date().toISOString(),
    updatedAt: result[0].updatedAt || new Date().toISOString(),
  };
}

/**
 * Create a new location
 */
export async function createLocation(data: LocationFormData & { ownerId: string }): Promise<Location> {
  const result = await db
    .insert(locations)
    .values({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  return {
    ...result[0],
    createdAt: result[0].createdAt || new Date().toISOString(),
    updatedAt: result[0].updatedAt || new Date().toISOString(),
  };
}

/**
 * Update an existing location
 */
export async function updateLocation(
  locationId: string, 
  ownerId: string, 
  data: LocationFormData
): Promise<Location | null> {
  const result = await db
    .update(locations)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
    .returning();

  if (!result[0]) return null;

  return {
    ...result[0],
    createdAt: result[0].createdAt || new Date().toISOString(),
    updatedAt: result[0].updatedAt || new Date().toISOString(),
  };
}

/**
 * Delete a location (and all associated rooms will be deleted via cascade)
 */
export async function deleteLocation(locationId: string, ownerId: string): Promise<boolean> {
  const result = await db
    .delete(locations)
    .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
    .returning();

  return result.length > 0;
}

/**
 * Check if location belongs to owner
 */
export async function verifyLocationOwnership(locationId: string, ownerId: string): Promise<boolean> {
  const location = await getLocationById(locationId, ownerId);
  return location !== null;
}
