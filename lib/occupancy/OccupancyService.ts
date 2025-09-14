/**
 * Business service for occupancy monitoring
 */
import type {
  OccupancyFilter,
  OccupancyResult,
  OccupancySlot,
  OccupancyStats
} from "../pricing/types";
import type { OccupancyRepository } from "./OccupancyRepository";

export class OccupancyService {
  constructor(private occupancyRepo: OccupancyRepository) {}

  /**
   * Get occupancy data with statistics
   */
  async getOccupancyData(ownerId: string, filter: OccupancyFilter): Promise<OccupancyResult> {
    const slots = await this.occupancyRepo.getOccupancySlots(ownerId, filter);
    const stats = this.calculateStats(slots);

    return {
      slots,
      stats,
      filters: filter,
    };
  }

  /**
   * Get filter options for owner
   */
  async getFilterOptions(ownerId: string) {
    const [locations, employees, rooms] = await Promise.all([
      this.occupancyRepo.getOwnerLocations(ownerId),
      this.occupancyRepo.getOwnerEmployees(ownerId),
      this.occupancyRepo.getOwnerRooms(ownerId),
    ]);

    return {
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
      })),
      employees: employees.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        type: emp.employeeType,
      })),
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        locationId: room.locationId,
        locationName: room.locationName,
        serviceTypes: JSON.parse(room.serviceTypes),
      })),
      serviceTypes: [
        { value: "physiotherapy", label: "Fizjoterapia" },
        { value: "personal_training", label: "Trening personalny" },
        { value: "other", label: "Inne" },
      ],
    };
  }

  /**
   * Calculate occupancy statistics
   */
  private calculateStats(slots: OccupancySlot[]): OccupancyStats {
    const totalSlots = slots.length;
    const confirmedSlots = slots.filter(slot => slot.status === 'confirmed').length;
    const deadHourSlots = slots.filter(slot => slot.isDeadHour).length;
    
    // Process only confirmed slots for calculations
    const confirmedReservations = slots.filter(slot => slot.status === 'confirmed');
    
    const totalRevenue = confirmedReservations
      .reduce((sum, slot) => sum + slot.finalPrice, 0);
    
    const totalEmployeeCost = confirmedReservations.reduce((sum, slot) => {
      const hours = (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60 * 60);
      return sum + (slot.hourlyRate * hours);
    }, 0);

    const totalProfit = totalRevenue - totalEmployeeCost;

    const deadHourReservations = confirmedReservations.filter(slot => slot.isDeadHour);
    
    const deadHourRevenue = deadHourReservations
      .reduce((sum, slot) => sum + slot.finalPrice, 0);

    const deadHourCost = deadHourReservations.reduce((sum, slot) => {
      const hours = (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60 * 60);
      return sum + (slot.hourlyRate * hours);
    }, 0);

    const deadHourProfit = deadHourRevenue - deadHourCost;

    const occupancyRate = totalSlots > 0 ? confirmedSlots / totalSlots : 0;

    return {
      totalSlots,
      confirmedSlots,
      totalRevenue,
      totalEmployeeCost,
      totalProfit,
      deadHourSlots,
      deadHourRevenue,
      deadHourProfit,
      occupancyRate,
    };
  }

  /**
   * Get default filter for current week
   */
  getDefaultFilter(): OccupancyFilter {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      dateFrom: startOfWeek.toISOString(),
      dateTo: endOfWeek.toISOString(),
    };
  }
}
