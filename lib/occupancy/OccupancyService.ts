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
    
    const totalRevenue = slots
      .filter(slot => slot.status === 'confirmed')
      .reduce((sum, slot) => sum + slot.finalPrice, 0);
    
    const deadHourRevenue = slots
      .filter(slot => slot.status === 'confirmed' && slot.isDeadHour)
      .reduce((sum, slot) => sum + slot.finalPrice, 0);

    const occupancyRate = totalSlots > 0 ? confirmedSlots / totalSlots : 0;

    return {
      totalSlots,
      confirmedSlots,
      totalRevenue,
      deadHourSlots,
      deadHourRevenue,
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

  /**
   * Generate quick filter presets
   */
  getFilterPresets() {
    const now = new Date();
    
    // Today
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // This week
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    // This month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return [
      {
        label: "Dzisiaj",
        filter: {
          dateFrom: today.toISOString(),
          dateTo: todayEnd.toISOString(),
        }
      },
      {
        label: "Ten tydzień",
        filter: {
          dateFrom: thisWeekStart.toISOString(),
          dateTo: thisWeekEnd.toISOString(),
        }
      },
      {
        label: "Ten miesiąc",
        filter: {
          dateFrom: thisMonthStart.toISOString(),
          dateTo: thisMonthEnd.toISOString(),
        }
      },
    ];
  }
}
