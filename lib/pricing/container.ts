/**
 * Dependency Injection Container for Pricing and Occupancy modules
 */
import { db } from "~/db/index";
import { OccupancyRepository } from "../occupancy/OccupancyRepository";
import { OccupancyService } from "../occupancy/OccupancyService";
import { EmployeesRepository } from "../reservation/repos/employees.repo";
import { PricingConfigRepository } from "./PricingConfigRepository";
import { PricingConfigService } from "./PricingConfigService";

class PricingOccupancyContainer {
  // Repositories
  private _pricingConfigRepo: PricingConfigRepository | null = null;
  private _occupancyRepo: OccupancyRepository | null = null;
  private _employeesRepo: EmployeesRepository | null = null;

  // Services
  private _pricingConfigService: PricingConfigService | null = null;
  private _occupancyService: OccupancyService | null = null;

  get pricingConfigRepo(): PricingConfigRepository {
    if (!this._pricingConfigRepo) {
      this._pricingConfigRepo = new PricingConfigRepository(db);
    }
    return this._pricingConfigRepo;
  }

  get occupancyRepo(): OccupancyRepository {
    if (!this._occupancyRepo) {
      this._occupancyRepo = new OccupancyRepository(db);
    }
    return this._occupancyRepo;
  }

  get employeesRepo(): EmployeesRepository {
    if (!this._employeesRepo) {
      this._employeesRepo = new EmployeesRepository(db);
    }
    return this._employeesRepo;
  }

  get pricingConfigService(): PricingConfigService {
    if (!this._pricingConfigService) {
      this._pricingConfigService = new PricingConfigService(
        this.pricingConfigRepo,
        this.employeesRepo
      );
    }
    return this._pricingConfigService;
  }

  get occupancyService(): OccupancyService {
    if (!this._occupancyService) {
      this._occupancyService = new OccupancyService(this.occupancyRepo);
    }
    return this._occupancyService;
  }
}

export const pricingOccupancyContainer = new PricingOccupancyContainer();
