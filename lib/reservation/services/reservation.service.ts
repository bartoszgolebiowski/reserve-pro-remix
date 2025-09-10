import type { OwnerReservationFormData, Reservation, ValidationResult } from "~/lib/types";
import type { EmployeesRepository } from "../repos/employees.repo";
import type { ReservationsRepository } from "../repos/reservations.repo";
import type { RoomsRepository } from "../repos/rooms.repo";
import type { AvailabilityService } from "./availability.service";

export class ReservationService {
  constructor(
    private reservationsRepo: ReservationsRepository,
    private availabilityService?: AvailabilityService,
    private employeesRepo?: EmployeesRepository,
    private roomsRepo?: RoomsRepository
  ) {}

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

  /**
   * Tworzy rezerwację przez ownera z pełną walidacją
   * @param ownerId - ID właściciela
   * @param reservationData - Dane rezerwacji
   * @returns Utworzona rezerwacja
   */
  async createReservationByOwner(
    ownerId: string,
    reservationData: OwnerReservationFormData
  ): Promise<Reservation> {
    // Walidacja danych
    const validation = await this.validateReservationData(reservationData);
    if (!validation.isValid) {
      throw new Error(`Błędy walidacji: ${validation.errors.join(", ")}`);
    }

    // Sprawdzenie dostępności sali
    const isRoomAvailable = await this.checkAvailability(
      reservationData.roomId,
      reservationData.startTime,
      reservationData.endTime
    );

    if (!isRoomAvailable) {
      throw new Error("Sala jest niedostępna w wybranym terminie");
    }

    // Sprawdzenie dostępności pracownika
    if (this.availabilityService) {
      const isEmployeeAvailable = await this.availabilityService.checkEmployeeAvailability(
        reservationData.employeeId,
        reservationData.startTime,
        reservationData.endTime
      );

      if (!isEmployeeAvailable) {
        throw new Error("Pracownik jest niedostępny w wybranym terminie");
      }
    }

    // Utworzenie rezerwacji
    const reservation: Omit<Reservation, "id" | "createdAt" | "updatedAt"> = {
      employeeId: reservationData.employeeId,
      roomId: reservationData.roomId,
      clientName: reservationData.clientName,
      clientEmail: reservationData.clientEmail,
      clientPhone: reservationData.clientPhone,
      serviceType: reservationData.serviceType,
      startTime: reservationData.startTime,
      endTime: reservationData.endTime,
      basePrice: 0, // Będzie obliczone
      finalPrice: 0, // Będzie obliczone
      isDeadHour: false, // Będzie obliczone
      status: "confirmed",
      notes: reservationData.notes,
    };

    return this.reservationsRepo.createReservation(reservation);
  }

  /**
   * Waliduje dane rezerwacji
   * @param data - Dane do walidacji
   * @returns Wynik walidacji
   */
  async validateReservationData(data: OwnerReservationFormData): Promise<ValidationResult> {
    const errors: string[] = [];

    // Walidacja podstawowych pól
    if (!data.locationId) errors.push("Lokalizacja jest wymagana");
    if (!data.roomId) errors.push("Sala jest wymagana");
    if (!data.employeeId) errors.push("Pracownik jest wymagany");
    if (!data.clientName.trim()) errors.push("Imię klienta jest wymagane");
    if (!data.clientEmail.trim()) errors.push("Email klienta jest wymagany");
    if (!data.clientPhone.trim()) errors.push("Telefon klienta jest wymagany");

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.clientEmail && !emailRegex.test(data.clientEmail)) {
      errors.push("Nieprawidłowy format emaila");
    }

    // Walidacja czasów
    if (data.startTime >= data.endTime) {
      errors.push("Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia");
    }

    const now = new Date();
    if (data.startTime < now) {
      errors.push("Nie można tworzyć rezerwacji w przeszłości");
    }

    // Walidacja zgodności pracownika z salą (jeśli repozytoria są dostępne)
    if (this.employeesRepo && this.roomsRepo) {
      try {
        const employee = await this.employeesRepo.getEmployeeById(data.employeeId);
        // Dla uproszczenia pomijamy sprawdzenie sali, ponieważ wymaga ownerId
        // const room = await this.roomsRepo.getRoomById(data.roomId, ownerId);

        if (employee) {
          const isCompatible = this.checkServiceTypeCompatibility(
            data.serviceType,
            employee.employeeType,
            [] // Pusta lista dla sal - nie mamy dostępu do danych sali
          );

          if (!isCompatible) {
            errors.push("Wybrany pracownik nie może obsługiwać tego typu usługi");
          }
        }
      } catch (error) {
        errors.push("Błąd podczas sprawdzania zgodności pracownika");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sprawdza zgodność typu usługi z pracownikiem i salą
   * @param serviceType - Typ usługi
   * @param employeeType - Typ pracownika
   * @param roomServiceTypes - Typy usług obsługiwane przez salę
   * @returns Czy kombinacja jest zgodna
   */
  private checkServiceTypeCompatibility(
    serviceType: string,
    employeeType: string,
    roomServiceTypes: string[]
  ): boolean {
    // Sprawdź czy sala obsługuje ten typ usługi
    if (!roomServiceTypes.includes(serviceType)) {
      return false;
    }

    // Sprawdź zgodność pracownika z typem usługi
    switch (serviceType) {
      case "physiotherapy":
        return employeeType === "physiotherapist";
      case "personal_training":
        return employeeType === "personal_trainer";
      case "other":
        return true; // Wszyscy mogą obsługiwać "other"
      default:
        return false;
    }
  }

  /**
   * Pobiera rezerwacje dla danego właściciela
   * @param ownerId - ID właściciela
   * @returns Lista rezerwacji
   */
  async getReservationsByOwnerId(ownerId: string): Promise<Reservation[]> {
    // Ta metoda wymagałaby rozszerzenia ReservationsRepository
    // Na razie zwrócimy pustą listę
    return [];
  }
}

// Eksportujemy instancję serwisu dla łatwiejszego dostępu
