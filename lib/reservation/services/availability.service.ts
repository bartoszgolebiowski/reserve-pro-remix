import type { AvailabilitySlot, Employee } from "../../types";
import type { EmployeesRepository } from "../repos/employees.repo";
import type { ReservationsRepository } from "../repos/reservations.repo";

/**
 * Serwis zarządzający dostępnością sal i pracowników
 */
export class AvailabilityService {
  constructor(
    private reservationsRepo: ReservationsRepository,
    private employeeRepo: EmployeesRepository
  ) {}

  /**
   * Sprawdza dostępne sloty czasowe dla sali w danym dniu
   * @param roomId - ID sali
   * @param date - Data
   * @param duration - Czas trwania w minutach
   * @returns Lista dostępnych slotów
   */
  async getAvailableSlots(
    roomId: string,
    date: Date,
    duration: number = 60
  ): Promise<AvailabilitySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // Start o 8:00

    const endOfDay = new Date(date);
    endOfDay.setHours(20, 0, 0, 0); // Koniec o 20:00

    // Pobierz istniejące rezerwacje dla tego dnia
    const existingReservations = await this.reservationsRepo.getReservationsByRoomIdAndDateRange(
      roomId,
      startOfDay,
      endOfDay
    );

    // Filtruj tylko potwierdzone rezerwacje
    const confirmedReservations = existingReservations.filter(
      (reservation) => reservation.status !== "cancelled"
    );

    const slots: AvailabilitySlot[] = [];
    const current = new Date(startOfDay);

    while (current < endOfDay) {
      const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
      
      // Sprawdź czy slot koliduje z istniejącymi rezerwacjami
      const isAvailable = !confirmedReservations.some(reservation => {
        const reservationStart = reservation.startTime;
        const reservationEnd = reservation.endTime;
        
        return (
          (current >= reservationStart && current < reservationEnd) ||
          (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
          (current <= reservationStart && slotEnd >= reservationEnd)
        );
      });

      slots.push({
        startTime: new Date(current),
        endTime: new Date(slotEnd),
        isAvailable
      });

      // Przejdź do następnego slotu (co 30 minut)
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Pobiera dostępnych pracowników dla lokalizacji, sali i typu usługi
   * @param locationId - ID lokalizacji
   * @param roomId - ID sali
   * @param serviceType - Typ usługi
   * @param startTime - Czas rozpoczęcia
   * @param endTime - Czas zakończenia
   * @returns Lista dostępnych pracowników
   */
  async getOccupiedSlotsForRoom(
    roomId: string,
    date: Date,
    windowHours = 24
  ): Promise<AvailabilitySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(windowHours, 0, 0, 0);
    
    const reservations = await this.reservationsRepo.getReservationsByRoomIdAndDateRange(
      roomId,
      startOfDay,
      endOfDay
    );
    
    return reservations
      .filter(r => r.status !== "cancelled")
      .map(r => ({
        startTime: r.startTime,
        endTime: r.endTime,
        employeeId: r.employeeId,
        isAvailable: false,
      }));
  }

  async getAvailableEmployees(
    locationId: string,
    roomId: string,
    serviceType: string,
    startTime: Date,
    endTime: Date
  ): Promise<Employee[]> {
    // Pobierz pracowników przypisanych do lokalizacji
    const locationEmployees = await this.employeeRepo.getEmployeesByLocation(locationId);

    // Filtruj pracowników według typu usługi
    const compatibleEmployees = locationEmployees.filter((employee: Employee) => {
      switch (serviceType) {
        case "physiotherapy":
          return employee.employeeType === "physiotherapist";
        case "personal_training":
          return employee.employeeType === "personal_trainer";
        case "other":
          return true; // Wszyscy pracownicy mogą obsługiwać "other"
        default:
          return false;
      }
    });

    // Sprawdź dostępność każdego pracownika w danym terminie
    const availableEmployees: Employee[] = [];
    
    for (const employee of compatibleEmployees) {
      const isAvailable = await this.checkEmployeeAvailability(
        employee.id,
        startTime,
        endTime
      );
      
      if (isAvailable) {
        availableEmployees.push(employee);
      }
    }

    return availableEmployees;
  }

  /**
   * Sprawdza dostępność pracownika w danym terminie
   * @param employeeId - ID pracownika
   * @param startTime - Czas rozpoczęcia
   * @param endTime - Czas zakończenia
   * @returns Czy pracownik jest dostępny
   */
  async checkEmployeeAvailability(
    employeeId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startTime);
    endOfDay.setHours(23, 59, 59, 999);

    // Pobierz rezerwacje pracownika w danym dniu
    const employeeReservations = await this.reservationsRepo.getReservationsByEmployeeId(employeeId);
    
    // Filtruj rezerwacje do tego dnia i tylko potwierdzone
    const dayReservations = employeeReservations.filter(reservation => {
      const reservationDate = new Date(reservation.startTime);
      return reservationDate >= startOfDay && 
             reservationDate <= endOfDay && 
             reservation.status !== "cancelled";
    });

    // Sprawdź czy nowy termin koliduje z istniejącymi
    return !dayReservations.some(reservation => {
      const reservationStart = reservation.startTime;
      const reservationEnd = reservation.endTime;
      
      return (
        (startTime >= reservationStart && startTime < reservationEnd) ||
        (endTime > reservationStart && endTime <= reservationEnd) ||
        (startTime <= reservationStart && endTime >= reservationEnd)
      );
    });
  }

  /**
   * Sugeruje alternatywne terminy jeśli wybrany jest niedostępny
   * @param roomId - ID sali
   * @param preferredDate - Preferowana data
   * @param duration - Czas trwania w minutach
   * @param daysToCheck - Ile dni sprawdzić w przód
   * @returns Lista sugerowanych terminów
   */
  async suggestAlternativeTimes(
    roomId: string,
    preferredDate: Date,
    duration: number = 60,
    daysToCheck: number = 7
  ): Promise<AvailabilitySlot[]> {
    const suggestions: AvailabilitySlot[] = [];
    const currentDate = new Date(preferredDate);

    for (let day = 0; day < daysToCheck; day++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() + day);

      const daySlots = await this.getAvailableSlots(roomId, checkDate, duration);
      const availableSlots = daySlots.filter(slot => slot.isAvailable);
      
      suggestions.push(...availableSlots.slice(0, 3)); // Max 3 sugestie na dzień
      
      if (suggestions.length >= 10) break; // Max 10 sugestii ogółem
    }

    return suggestions.slice(0, 10);
  }
}
