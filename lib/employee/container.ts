/**
 * Dependency Injection Container for Employee Module
 */
import { db } from "~/db/index";
import { UsersRepository } from "~/lib/auth/repos/users.repo";
import { SecurityService } from "~/lib/auth/security.server";
import { AuthValidators } from "~/lib/auth/validators.server";
import { EmployeesRepository } from "~/lib/reservation/repos/employees.repo";
import { LocationsRepository } from "~/lib/reservation/repos/locations.repo";
import { EmployeeService } from "./services/employee.service";

class EmployeeContainer {
  private _usersRepo: UsersRepository | null = null;
  private _employeesRepo: EmployeesRepository | null = null;
  private _locationsRepo: LocationsRepository | null = null;
  private _securityService: SecurityService | null = null;
  private _authValidators: AuthValidators | null = null;
  private _employeeService: EmployeeService | null = null;

  get usersRepo(): UsersRepository {
    if (!this._usersRepo) {
      this._usersRepo = new UsersRepository(db);
    }
    return this._usersRepo;
  }

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

  get securityService(): SecurityService {
    if (!this._securityService) {
      this._securityService = new SecurityService();
    }
    return this._securityService;
  }

  get authValidators(): AuthValidators {
    if (!this._authValidators) {
      this._authValidators = new AuthValidators();
    }
    return this._authValidators;
  }

  get employeeService(): EmployeeService {
    if (!this._employeeService) {
      this._employeeService = new EmployeeService(
        db,
        this.usersRepo,
        this.employeesRepo,
        this.locationsRepo,
        this.securityService
      );
    }
    return this._employeeService;
  }
}

export const employeeContainer = new EmployeeContainer();
