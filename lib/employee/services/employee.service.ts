/**
 * Serwis zarządzania pracownikami
 */
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "~/db/index";
import { employees } from "~/db/schema/reservations";
import type { UsersRepository } from "~/lib/auth/repos/users.repo";
import type { SecurityService } from "~/lib/auth/security.server";
import type { EmployeesRepository } from "~/lib/reservation/repos/employees.repo";
import type { LocationsRepository } from "~/lib/reservation/repos/locations.repo";
import type {
    CreateEmployeeData,
    EmployeeWithLocations,
    UpdateEmployeeData,
} from "../types/employee.types";

export class EmployeeService {
  constructor(
    private db: DrizzleDatabase,
    private usersRepo: UsersRepository,
    private employeesRepo: EmployeesRepository,
    private locationsRepo: LocationsRepository,
    private securityService: SecurityService
  ) {}

  /**
   * Pobiera wszystkich pracowników z ich lokalizacjami
   */
  async getAllEmployeesWithLocations(ownerId: string): Promise<EmployeeWithLocations[]> {
    const employeesList = await this.employeesRepo.getAllEmployees();
    const ownerLocations = await this.locationsRepo.getLocationsByOwnerId(ownerId);
    const ownerLocationIds = ownerLocations.map(loc => loc.id);

    const result: EmployeeWithLocations[] = [];

    for (const employee of employeesList) {
      const employeeLocations = await this.employeesRepo.getEmployeeLocations(employee.id);
      
      // Filtruj tylko lokalizacje należące do tego właściciela
      const filteredLocations = employeeLocations.filter(el => 
        ownerLocationIds.includes(el.locationId)
      );

      const locationsWithNames = filteredLocations.map(el => {
        const location = ownerLocations.find(loc => loc.id === el.locationId);
        return {
          locationId: el.locationId,
          locationName: location?.name || 'Nieznana lokalizacja',
          hourlyRate: el.hourlyRate,
        };
      });

      // Dodaj pracownika tylko jeśli ma przypisane lokalizacje tego właściciela
      if (locationsWithNames.length > 0) {
        result.push({
          ...employee,
          createdAt: employee.createdAt || new Date().toISOString(),
          updatedAt: employee.updatedAt || new Date().toISOString(),
          locations: locationsWithNames,
        });
      }
    }

    return result;
  }

  /**
   * Pobiera pracownika po ID z jego lokalizacjami
   */
  async getEmployeeWithLocations(employeeId: string, ownerId: string): Promise<EmployeeWithLocations | null> {
    const employee = await this.employeesRepo.getEmployeeById(employeeId);
    if (!employee) return null;

    const employeeLocations = await this.employeesRepo.getEmployeeLocations(employeeId);
    const ownerLocations = await this.locationsRepo.getLocationsByOwnerId(ownerId);
    const ownerLocationIds = ownerLocations.map(loc => loc.id);

    // Filtruj tylko lokalizacje należące do tego właściciela
    const filteredLocations = employeeLocations.filter(el => 
      ownerLocationIds.includes(el.locationId)
    );

    const locationsWithNames = filteredLocations.map(el => {
      const location = ownerLocations.find(loc => loc.id === el.locationId);
      return {
        locationId: el.locationId,
        locationName: location?.name || 'Nieznana lokalizacja',
        hourlyRate: el.hourlyRate,
      };
    });

    return {
      ...employee,
      createdAt: employee.createdAt || new Date().toISOString(),
      updatedAt: employee.updatedAt || new Date().toISOString(),
      locations: locationsWithNames,
    };
  }

  /**
   * Tworzy nowego pracownika
   */
  async createEmployee(data: CreateEmployeeData, ownerId: string): Promise<{
    success: boolean;
    employee?: EmployeeWithLocations;
    errors?: Record<string, string>;
  }> {
    try {
      // Sprawdź czy email już istnieje
      const existingUser = await this.usersRepo.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          errors: { email: "Ten adres email jest już zajęty" }
        };
      }

      // Sprawdź czy lokalizacje należą do właściciela
      const ownerLocations = await this.locationsRepo.getLocationsByOwnerId(ownerId);
      const ownerLocationIds = ownerLocations.map(loc => loc.id);
      
      const invalidLocationIds = data.locations
        .map(l => l.locationId)
        .filter(id => !ownerLocationIds.includes(id));
      
      if (invalidLocationIds.length > 0) {
        return {
          success: false,
          errors: { locations: "Niektóre lokalizacje nie należą do Ciebie" }
        };
      }

      // Zahashuj hasło
      const passwordHash = await this.securityService.hashPassword(data.password);

      // Utwórz użytkownika
      const user = await this.usersRepo.createUser({
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "WORKER",
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Utwórz rekord pracownika
      await this.db.insert(employees).values({
        id: user.id,
        employeeType: data.employeeType,
      });

      // Przypisz do lokalizacji
      for (const location of data.locations) {
        await this.employeesRepo.assignEmployeeToLocation(
          user.id,
          location.locationId,
          location.hourlyRate
        );
      }

      // Pobierz utworzonego pracownika z lokalizacjami
      const newEmployee = await this.getEmployeeWithLocations(user.id, ownerId);

      return {
        success: true,
        employee: newEmployee!,
      };
    } catch (error) {
      console.error("Error creating employee:", error);
      return {
        success: false,
        errors: { _form: "Wystąpił błąd podczas tworzenia pracownika" }
      };
    }
  }

  /**
   * Aktualizuje pracownika
   */
  async updateEmployee(
    employeeId: string, 
    data: UpdateEmployeeData, 
    ownerId: string
  ): Promise<{
    success: boolean;
    employee?: EmployeeWithLocations;
    errors?: Record<string, string>;
  }> {
    try {
      // Sprawdź czy pracownik istnieje
      const existingEmployee = await this.getEmployeeWithLocations(employeeId, ownerId);
      if (!existingEmployee) {
        return {
          success: false,
          errors: { _form: "Pracownik nie został znaleziony" }
        };
      }

      // Aktualizuj dane użytkownika jeśli potrzeba
      if (data.firstName || data.lastName) {
        await this.usersRepo.updateUser(employeeId, {
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      // Aktualizuj typ pracownika jeśli potrzeba
      if (data.employeeType) {
        await this.db
          .update(employees)
          .set({ 
            employeeType: data.employeeType,
            updatedAt: new Date().toISOString()
          })
          .where(eq(employees.id, employeeId));
      }

      // Aktualizuj lokalizacje jeśli potrzeba
      if (data.locations) {
        // Sprawdź czy lokalizacje należą do właściciela
        const ownerLocations = await this.locationsRepo.getLocationsByOwnerId(ownerId);
        const ownerLocationIds = ownerLocations.map(loc => loc.id);
        
        const invalidLocationIds = data.locations
          .map(l => l.locationId)
          .filter(id => !ownerLocationIds.includes(id));
        
        if (invalidLocationIds.length > 0) {
          return {
            success: false,
            errors: { locations: "Niektóre lokalizacje nie należą do Ciebie" }
          };
        }

        // Usuń istniejące przypisania do lokalizacji właściciela
        const currentEmployeeLocations = await this.employeesRepo.getEmployeeLocations(employeeId);
        for (const currentLocation of currentEmployeeLocations) {
          if (ownerLocationIds.includes(currentLocation.locationId)) {
            await this.employeesRepo.removeEmployeeFromLocation(
              employeeId, 
              currentLocation.locationId
            );
          }
        }

        // Dodaj nowe przypisania
        for (const location of data.locations) {
          await this.employeesRepo.assignEmployeeToLocation(
            employeeId,
            location.locationId,
            location.hourlyRate
          );
        }
      }

      // Pobierz zaktualizowanego pracownika
      const updatedEmployee = await this.getEmployeeWithLocations(employeeId, ownerId);

      return {
        success: true,
        employee: updatedEmployee!,
      };
    } catch (error) {
      console.error("Error updating employee:", error);
      return {
        success: false,
        errors: { _form: "Wystąpił błąd podczas aktualizacji pracownika" }
      };
    }
  }

  /**
   * Usuwa pracownika (tylko usunięcie przypisań do lokalizacji właściciela)
   */
  async removeEmployeeFromOwnerLocations(
    employeeId: string, 
    ownerId: string
  ): Promise<{ success: boolean; errors?: Record<string, string> }> {
    try {
      const ownerLocations = await this.locationsRepo.getLocationsByOwnerId(ownerId);
      const ownerLocationIds = ownerLocations.map(loc => loc.id);

      const employeeLocations = await this.employeesRepo.getEmployeeLocations(employeeId);
      
      // Usuń przypisania tylko do lokalizacji właściciela
      for (const employeeLocation of employeeLocations) {
        if (ownerLocationIds.includes(employeeLocation.locationId)) {
          await this.employeesRepo.removeEmployeeFromLocation(
            employeeId,
            employeeLocation.locationId
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing employee from locations:", error);
      return {
        success: false,
        errors: { _form: "Wystąpił błąd podczas usuwania pracownika" }
      };
    }
  }
}
