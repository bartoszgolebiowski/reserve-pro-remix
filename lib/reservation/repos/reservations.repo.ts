import { and, eq, gte, lte } from "drizzle-orm";
import type { DrizzleDatabase } from "~/db/index";
import { reservations } from "~/db/schema/reservations";
import type { Reservation } from "~/lib/types";

export class ReservationsRepository {
  constructor(private db: DrizzleDatabase) {}
  /**
   * Pobiera wszystkie rezerwacje dla danej sali
   * @param roomId - ID sali
   * @returns Lista rezerwacji
   */
  async getReservationsByRoomId(roomId: string) {
    const results = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.roomId, roomId));

    return results.map(this.mapDbReservationToReservation);
  }

  /**
   * Pobiera rezerwacje dla danej sali w określonym przedziale czasowym
   * @param roomId - ID sali
   * @param startDate - Data początkowa
   * @param endDate - Data końcowa
   * @returns Lista rezerwacji
   */
  async getReservationsByRoomIdAndDateRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ) {
    const startISOString = startDate.toISOString();
    const endISOString = endDate.toISOString();

    const results = await this.db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          gte(reservations.startTime, startISOString),
          lte(reservations.startTime, endISOString)
        )
      );

    return results.map(this.mapDbReservationToReservation);
  }

  /**
   * Pobiera rezerwacje dla danego pracownika
   * @param employeeId - ID pracownika
   * @returns Lista rezerwacji
   */
  async getReservationsByEmployeeId(employeeId: string){
    const results = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.employeeId, employeeId));

    return results.map(this.mapDbReservationToReservation);
  }

  /**
   * Tworzy nową rezerwację
   * @param data - Dane rezerwacji
   * @returns Utworzona rezerwacja
   */
  async createReservation(data: Omit<Reservation, "id" | "createdAt" | "updatedAt">){
    const startTime = typeof data.startTime === 'string' 
      ? data.startTime 
      : data.startTime.toISOString();
    
    const endTime = typeof data.endTime === 'string' 
      ? data.endTime 
      : data.endTime.toISOString();

    const result = await this.db.insert(reservations).values({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      serviceType: data.serviceType,
      startTime,
      endTime,
      employeeId: data.employeeId,
      roomId: data.roomId,
      basePrice: data.basePrice,
      finalPrice: data.finalPrice,
      isDeadHour: data.isDeadHour,
      status: data.status,
      notes: data.notes
    }).returning();

    if (!result[0]) {
      throw new Error("Failed to create reservation");
    }

    return this.mapDbReservationToReservation(result[0]);
  }

  /**
   * Aktualizuje rezerwację
   * @param id - ID rezerwacji
   * @param data - Dane do aktualizacji
   * @returns Zaktualizowana rezerwacja
   */
  async updateReservation(id: string, data: Partial<Omit<Reservation, "id" | "createdAt" | "updatedAt">>) {
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (data.clientName) updateData.clientName = data.clientName;
    if (data.clientEmail) updateData.clientEmail = data.clientEmail;
    if (data.clientPhone) updateData.clientPhone = data.clientPhone;
    if (data.serviceType) updateData.serviceType = data.serviceType;
    if (data.startTime) {
      updateData.startTime = typeof data.startTime === 'string' 
        ? data.startTime 
        : data.startTime.toISOString();
    }
    if (data.endTime) {
      updateData.endTime = typeof data.endTime === 'string' 
        ? data.endTime 
        : data.endTime.toISOString();
    }
    if (data.employeeId) updateData.employeeId = data.employeeId;
    if (data.roomId) updateData.roomId = data.roomId;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.finalPrice !== undefined) updateData.finalPrice = data.finalPrice;
    if (data.isDeadHour !== undefined) updateData.isDeadHour = data.isDeadHour;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const result = await this.db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.id, id))
      .returning();

    if (!result[0]) {
      throw new Error("Reservation not found");
    }

    return this.mapDbReservationToReservation(result[0]);
  }

  /**
   * Usuwa rezerwację
   * @param id - ID rezerwacji
   * @returns Czy operacja się powiodła
   */
  async deleteReservation(id: string) {
    const result = await this.db
      .delete(reservations)
      .where(eq(reservations.id, id))
      .returning({ id: reservations.id });

    return result.length > 0;
  }

  /**
   * Mapuje obiekt rezerwacji z bazy danych na obiekt biznesowy
   * @param dbReservation - Obiekt rezerwacji z bazy danych
   * @returns Obiekt biznesowy rezerwacji
   */
  /**
   * Mapuje rekord z bazy danych na obiekt Reservation
   * @param dbReservation - Rekord z bazy danych
   * @returns Obiekt Reservation
   */
  private mapDbReservationToReservation(dbReservation: typeof reservations.$inferSelect) {
    return {
      id: dbReservation.id,
      clientName: dbReservation.clientName,
      clientEmail: dbReservation.clientEmail,
      clientPhone: dbReservation.clientPhone,
      serviceType: dbReservation.serviceType,
      startTime: new Date(dbReservation.startTime),
      endTime: new Date(dbReservation.endTime),
      employeeId: dbReservation.employeeId,
      roomId: dbReservation.roomId,
      basePrice: dbReservation.basePrice,
      finalPrice: dbReservation.finalPrice,
      isDeadHour: dbReservation.isDeadHour ?? false,
      status: dbReservation.status ?? "confirmed",
      notes: dbReservation.notes ?? undefined,
      createdAt: dbReservation.createdAt ?? new Date().toISOString(),
      updatedAt: dbReservation.updatedAt ?? new Date().toISOString()
    };
  }
}
