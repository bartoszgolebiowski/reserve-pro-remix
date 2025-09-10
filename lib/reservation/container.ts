/**
 * Dependency Injection Container for Reservation System
 */
import { db } from "~/db/index";
import { EmployeesRepository } from "./repos/employees.repo";
import { LocationsRepository } from "./repos/locations.repo";
import { PricingRepository } from "./repos/pricing.repo";
import { ReservationsRepository } from "./repos/reservations.repo";
import { RoomsRepository } from "./repos/rooms.repo";
import { PricingService } from "./services/pricing.service";
import { ReservationService } from "./services/reservation.service";

class ReservationServiceContainer {
  // Repositories
  private _employeesRepo: EmployeesRepository | null = null;
  private _locationsRepo: LocationsRepository | null = null;
  private _pricingRepo: PricingRepository | null = null;
  private _reservationsRepo: ReservationsRepository | null = null;
  private _roomsRepo: RoomsRepository | null = null;

  // Services
  private _pricingService: PricingService | null = null;
  private _reservationService: ReservationService | null = null;

  get employeesRepo(): EmployeesRepository {
    if (!this._employeesRepo) {
      this._employeesRepo = new EmployeesRepository(db);
    }
    return this._employeesRepo;
  }

  get locationsRepo(): LocationsRepository {
    if (!this._locationsRepo) {
      this._locationsRepo = new LocationsRepository(db);
    }
    return this._locationsRepo;
  }

  get pricingRepo(): PricingRepository {
    if (!this._pricingRepo) {
      this._pricingRepo = new PricingRepository(db);
    }
    return this._pricingRepo;
  }

  get reservationsRepo(): ReservationsRepository {
    if (!this._reservationsRepo) {
      this._reservationsRepo = new ReservationsRepository(db);
    }
    return this._reservationsRepo;
  }

  get roomsRepo(): RoomsRepository {
    if (!this._roomsRepo) {
      this._roomsRepo = new RoomsRepository(db);
    }
    return this._roomsRepo;
  }

  get pricingService(): PricingService {
    if (!this._pricingService) {
      this._pricingService = new PricingService(this.pricingRepo);
    }
    return this._pricingService;
  }

  get reservationService(): ReservationService {
    if (!this._reservationService) {
      this._reservationService = new ReservationService(this.reservationsRepo);
    }
    return this._reservationService;
  }
}

export const reservationContainer = new ReservationServiceContainer();
