import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "~/db/index";
import { users } from "~/db/schema/auth";
import { employeeLocations, employees, locations } from "~/db/schema/reservations";

export class EmployeesRepository {
  constructor(private db: DrizzleDatabase) {}
  /**
   * Pobiera wszystkich pracowników
   * @returns Lista pracowników
   */
  async getAllEmployees() {
    const results = await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.id, users.id));

    return results;
  }

  /**
   * Pobiera pracownika po ID
   * @param id - ID pracownika
   * @returns Dane pracownika
   */
  async getEmployeeById(id: string) {
    const results = await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.id, users.id))
      .where(eq(employees.id, id));

    return results[0] || null;
  }

  /**
   * Pobiera pracowników dla danej lokalizacji
   * @param locationId - ID lokalizacji
   * @returns Lista pracowników
   */
  async getEmployeesByLocation(locationId: string) {
    const results = await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        hourlyRate: employeeLocations.hourlyRate,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.id, users.id))
      .innerJoin(
        employeeLocations,
        and(
          eq(employees.id, employeeLocations.employeeId),
          eq(employeeLocations.locationId, locationId)
        )
      );

    return results;
  }

  /**
   * Pobiera wszystkich pracowników właściciela (z wszystkich jego lokalizacji)
   * @param ownerId - ID właściciela
   * @returns Lista pracowników z danymi lokalizacji
   */
  async getEmployeesByOwnerId(ownerId: string) {
    const results = await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        hourlyRate: employeeLocations.hourlyRate,
        locationId: locations.id,
        locationName: locations.name,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.id, users.id))
      .innerJoin(employeeLocations, eq(employees.id, employeeLocations.employeeId))
      .innerJoin(locations, eq(employeeLocations.locationId, locations.id))
      .where(eq(locations.ownerId, ownerId))
      .orderBy(users.firstName, users.lastName);

    return results;
  }

  /**
   * Pobiera pracownika po ID z danymi stawki dla konkretnej lokalizacji
   * @param employeeId - ID pracownika
   * @param locationId - ID lokalizacji
   * @returns Dane pracownika ze stawką
   */
  async getEmployeeWithRateByLocation(employeeId: string, locationId: string) {
    const results = await this.db
      .select({
        id: employees.id,
        employeeType: employees.employeeType,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        hourlyRate: employeeLocations.hourlyRate,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.id, users.id))
      .innerJoin(
        employeeLocations,
        and(
          eq(employees.id, employeeLocations.employeeId),
          eq(employeeLocations.locationId, locationId)
        )
      )
      .where(eq(employees.id, employeeId))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Pobiera lokalizacje pracownika wraz z stawkami godzinowymi
   * @param employeeId - ID pracownika
   * @returns Lista lokalizacji pracownika
   */
  async getEmployeeLocations(employeeId: string) {
    const results = await this.db
      .select()
      .from(employeeLocations)
      .where(eq(employeeLocations.employeeId, employeeId));

    return results;
  }

  /**
   * Pobiera pełne dane lokalizacji pracownika wraz z stawkami godzinowymi
   * @param employeeId - ID pracownika
   * @returns Lista lokalizacji pracownika z pełnymi danymi
   */
  async getEmployeeLocationsWithDetails(employeeId: string) {
    const results = await this.db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        ownerId: locations.ownerId,
        hourlyRate: employeeLocations.hourlyRate,
        createdAt: employeeLocations.createdAt,
      })
      .from(employeeLocations)
      .innerJoin(locations, eq(employeeLocations.locationId, locations.id))
      .where(eq(employeeLocations.employeeId, employeeId));

    return results;
  }

  /**
   * Przypisuje pracownika do lokalizacji z określoną stawką godzinową
   * @param employeeId - ID pracownika
   * @param locationId - ID lokalizacji
   * @param hourlyRate - Stawka godzinowa
   * @returns Czy operacja się powiodła
   */
  async assignEmployeeToLocation(
    employeeId: string,
    locationId: string,
    hourlyRate: number
  ) {
    // Sprawdź czy już istnieje takie przypisanie
    const existingAssignment = await this.db
      .select()
      .from(employeeLocations)
      .where(
        and(
          eq(employeeLocations.employeeId, employeeId),
          eq(employeeLocations.locationId, locationId)
        )
      );

    if (existingAssignment.length > 0) {
      // Aktualizuj stawkę jeśli przypisanie już istnieje
      await this.db
        .update(employeeLocations)
        .set({ hourlyRate })
        .where(
          and(
            eq(employeeLocations.employeeId, employeeId),
            eq(employeeLocations.locationId, locationId)
          )
        );
      return true;
    }

    // Dodaj nowe przypisanie
    const result = await this.db
      .insert(employeeLocations)
      .values({
        employeeId,
        locationId,
        hourlyRate,
      })
      .returning();

    return result.length > 0;
  }

  /**
   * Usuwa przypisanie pracownika do lokalizacji
   * @param employeeId - ID pracownika
   * @param locationId - ID lokalizacji
   * @returns Czy operacja się powiodła
   */
  async removeEmployeeFromLocation(employeeId: string, locationId: string) {
    const result = await this.db
      .delete(employeeLocations)
      .where(
        and(
          eq(employeeLocations.employeeId, employeeId),
          eq(employeeLocations.locationId, locationId)
        )
      )
      .returning();

    return result.length > 0;
  }
}
