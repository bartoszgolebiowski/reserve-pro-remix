import type { Reservation } from "~/lib/types";
import type { ReservationsRepository } from "../repos/reservations.repo";

export class ReservationService {
  constructor(private reservationsRepo: ReservationsRepository) {}

  /**
   * Pobiera wszystkie rezerwacje dla danej sali
   * @param roomId - ID sali
   * @returns Lista rezerwacji
   */
  async getReservationsByRoom(roomId: string) {
    return this.reservationsRepo.getReservationsByRoomId(roomId);
  }

  /**
   * Pobiera rezerwacje dla danej sali w wybranym tygodniu
   * @param roomId - ID sali
   * @param weekStartDate - Data początku tygodnia
   * @returns Lista rezerwacji
   */
  async getWeeklyReservationsForRoom(roomId: string, weekStartDate: Date) {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 7);

    return this.reservationsRepo.getReservationsByRoomIdAndDateRange(
      roomId,
      weekStartDate,
      weekEndDate
    );
  }

  /**
   * Tworzy nową rezerwację z walidacją dostępności
   * @param reservationData - Dane rezerwacji
   * @returns Utworzona rezerwacja
   */
  async createReservation(
    reservationData: Omit<Reservation, "id" | "createdAt" | "updatedAt">
  ) {
    // Sprawdzenie dostępności terminu
    const isAvailable = await this.checkAvailability(
      reservationData.roomId,
      reservationData.startTime,
      reservationData.endTime
    );

    if (!isAvailable) {
      throw new Error("Ten termin jest już zajęty");
    }

    return this.reservationsRepo.createReservation(reservationData);
  }

  /**
   * Anuluje rezerwację
   * @param reservationId - ID rezerwacji
   * @returns Zaktualizowana rezerwacja
   */
  async cancelReservation(reservationId: string) {
    return this.reservationsRepo.updateReservation(reservationId, {
      status: "cancelled",
    });
  }

  /**
   * Oznacza rezerwację jako zakończoną
   * @param reservationId - ID rezerwacji
   * @returns Zaktualizowana rezerwacja
   */
  async completeReservation(reservationId: string): Promise<Reservation> {
    return this.reservationsRepo.updateReservation(reservationId, {
      status: "completed",
    });
  }

  /**
   * Sprawdza dostępność sali w danym terminie
   * @param roomId - ID sali
   * @param startTime - Czas rozpoczęcia
   * @param endTime - Czas zakończenia
   * @returns Czy sala jest dostępna
   */
  async checkAvailability(
    roomId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const startDay = new Date(startTime);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(startTime);
    endDay.setHours(23, 59, 59, 999);

    // Pobierz wszystkie rezerwacje dla sali w danym dniu
    const existingReservations =
      await this.reservationsRepo.getReservationsByRoomIdAndDateRange(
        roomId,
        startDay,
        endDay
      );

    // Filtrowanie tylko potwierdzonych rezerwacji
    const confirmedReservations = existingReservations.filter(
      (reservation) => reservation.status !== "cancelled"
    );

    // Sprawdzenie czy występuje nakładanie się terminów
    for (const reservation of confirmedReservations) {
      const reservationStart = reservation.startTime;
      const reservationEnd = reservation.endTime;

      // Sprawdzenie nakładania się terminów
      if (
        (startTime < reservationEnd && endTime > reservationStart) ||
        (startTime.getTime() === reservationStart.getTime() &&
          endTime.getTime() === reservationEnd.getTime())
      ) {
        return false; // Terminy się nakładają
      }
    }

    return true; // Termin jest dostępny
  }

  /**
   * Oblicza cenę rezerwacji na podstawie różnych czynników
   * @param serviceType - Typ usługi
   * @param startTime - Czas rozpoczęcia
   * @param endTime - Czas zakończenia
   * @param employeeRate - Stawka pracownika
   * @param deadHoursStart - Początek martwych godzin
   * @param deadHoursEnd - Koniec martwych godzin
   * @param deadHourDiscount - Zniżka na martwe godziny
   * @param baseRates - Stawki podstawowe dla różnych typów usług
   * @param weekdayMultiplier - Mnożnik dla dni roboczych
   * @param weekendMultiplier - Mnożnik dla weekendów
   * @returns Obliczona cena
   */
  calculateReservationPrice({
    serviceType,
    startTime,
    endTime,
    employeeRate,
    deadHoursStart,
    deadHoursEnd,
    deadHourDiscount,
    baseRates,
    weekdayMultiplier,
    weekendMultiplier,
  }: {
    serviceType: string;
    startTime: Date;
    endTime: Date;
    employeeRate: number;
    deadHoursStart: number;
    deadHoursEnd: number;
    deadHourDiscount: number;
    baseRates: Record<string, number>;
    weekdayMultiplier: number;
    weekendMultiplier: number;
  }): { basePrice: number; finalPrice: number; isDeadHour: boolean } {
    // Obliczenie podstawowej ceny dla wybranego typu usługi
    const basePrice = baseRates[serviceType] || baseRates.other || 100;

    // Sprawdzenie czy termin jest w weekend
    const isWeekend = startTime.getDay() === 0 || startTime.getDay() === 6;

    // Wybór odpowiedniego mnożnika
    const multiplier = isWeekend ? weekendMultiplier : weekdayMultiplier;

    // Obliczenie ceny z mnożnikiem
    let finalPrice = basePrice * multiplier;

    // Sprawdzenie czy termin jest w martwych godzinach
    const startHour = startTime.getHours();
    const isDeadHour = startHour >= deadHoursStart && startHour < deadHoursEnd;

    // Zastosowanie zniżki dla martwych godzin
    if (isDeadHour) {
      finalPrice = finalPrice * (1 - deadHourDiscount);
    }

    // Zaokrąglenie do 2 miejsc po przecinku
    finalPrice = Math.round(finalPrice * 100) / 100;

    return {
      basePrice,
      finalPrice,
      isDeadHour,
    };
  }
}

// Eksportujemy instancję serwisu dla łatwiejszego dostępu
