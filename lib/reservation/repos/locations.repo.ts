/**
 * Repository for locations management
 */
import { and, eq } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../db";
import { locations, rooms } from "../../../db/schema/reservations";
import type { LocationFormData } from "../../types";

export class LocationsRepository {
  constructor(private db: DrizzleDatabase) {}

  /**
   * Get all locations belonging to a specific owner
   */
  async getLocationsByOwnerId(ownerId: string) {
    const result = await this.db
      .select()
      .from(locations)
      .where(eq(locations.ownerId, ownerId))
      .orderBy(locations.createdAt);

    return result.map((location) => ({
      ...location,
      createdAt: location.createdAt || new Date().toISOString(),
      updatedAt: location.updatedAt || new Date().toISOString(),
    }));
  }

  /**
   * Get locations with room count for a specific owner
   */
  async getLocationsWithRoomCountByOwnerId(ownerId: string) {
    const locationsData = await this.getLocationsByOwnerId(ownerId);

    const locationsWithRoomCount = await Promise.all(
      locationsData.map(async (location) => {
        const roomsData = await this.db
          .select()
          .from(rooms)
          .where(eq(rooms.locationId, location.id));

        return {
          ...location,
          roomCount: roomsData.length,
        };
      })
    );

    return locationsWithRoomCount;
  }

  /**
   * Get a single location by ID (with owner verification)
   */
  async getLocationById(locationId: string, ownerId: string) {
    const result = await this.db
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
  async createLocation(data: LocationFormData & { ownerId: string }) {
    const result = await this.db
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
  async updateLocation(
    locationId: string,
    ownerId: string,
    data: LocationFormData
  ) {
    const result = await this.db
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
  async deleteLocation(locationId: string, ownerId: string) {
    const result = await this.db
      .delete(locations)
      .where(and(eq(locations.id, locationId), eq(locations.ownerId, ownerId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Check if location belongs to owner
   */
  async verifyLocationOwnership(locationId: string, ownerId: string) {
    const location = await this.getLocationById(locationId, ownerId);
    return location !== null;
  }
}
