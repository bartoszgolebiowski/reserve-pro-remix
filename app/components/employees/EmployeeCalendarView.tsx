import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { Reservation } from "~/lib/types";
import {
  NewReservationModal,
  type ReservationFormData,
  type Room,
} from "./NewReservationModal";

// Types for employee calendar
export interface EmployeeLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  ownerId: string;
  hourlyRate: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeType: "physiotherapist" | "personal_trainer";
}

export interface EmployeeCalendarViewProps {
  employee: Employee;
  locations: EmployeeLocation[];
  rooms: Room[];
  reservations: Reservation[];
  currentWeek: Date;
}

export function EmployeeCalendarView({
  employee,
  locations,
  rooms,
  reservations,
  currentWeek: initialWeek,
}: EmployeeCalendarViewProps) {
  // State for week navigation
  const [currentWeek, setCurrentWeek] = useState(initialWeek);

  // State for location filters
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set(locations.map((loc) => loc.id))
  );

  // State for modals
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState<number | undefined>();

  // Calculate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, [currentWeek]);

  // Time slots from 6:00 to 22:00
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        isDeadHour: hour >= 8 && hour < 16, // Dead hours from 8:00 to 16:00
      });
    }
    return slots;
  }, []);

  // Get all reservations for current week (don't filter by location yet)
  const weeklyReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      // Check if reservation is in current week
      const reservationDate = reservation.startTime;
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return reservationDate >= weekStart && reservationDate <= weekEnd;
    });
  }, [reservations, currentWeek]);

  // Get reservations for a specific date and hour with location filter info
  const getReservationsForTimeSlot = (date: Date, hour: number) => {
    const dayStr = date.toDateString();
    return weeklyReservations
      .filter((reservation) => {
        const reservationDate = reservation.startTime;
        const reservationHour = reservationDate.getHours();
        const reservationMinutes = reservationDate.getMinutes();
        const endHour = reservation.endTime.getHours();
        const endMinutes = reservation.endTime.getMinutes();

        if (reservationDate.toDateString() !== dayStr) return false;

        // Check if this hour slot overlaps with the reservation
        if (hour >= reservationHour && hour < endHour) {
          return true;
        }

        // Handle edge case where reservation starts in this hour
        if (hour === reservationHour && reservationMinutes === 0) {
          return true;
        }

        return false;
      })
      .map((reservation) => ({
        ...reservation,
        isLocationActive: reservation.locationId
          ? selectedLocations.has(reservation.locationId)
          : true,
      }));
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeek);
    previousWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(previousWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const goToToday = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    setCurrentWeek(startOfWeek);
  };

  // Location filter functions
  const toggleLocation = (locationId: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  };

  const toggleAllLocations = () => {
    if (selectedLocations.size === locations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(locations.map((loc) => loc.id)));
    }
  };

  // Format helpers
  const formatWeekRange = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    return `${startDate.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
    })} - ${endDate.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case "physiotherapy":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "personal_training":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getServiceTypeName = (serviceType: string) => {
    switch (serviceType) {
      case "physiotherapy":
        return "Fizjoterapia";
      case "personal_training":
        return "Trening personalny";
      default:
        return "Inne";
    }
  };

  // Handle adding new reservation
  const handleAddReservation = (date?: Date, hour?: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setIsNewReservationModalOpen(true);
  };

  const handleNewReservationSubmit = async (data: ReservationFormData) => {
    try {
      // Create form data for API submission
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/employee/reservations", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create reservation");
      }

      // TODO: Refresh the calendar data
      console.log("Reservation created successfully:", result);

      // In a real app, you would update the reservations state or refetch data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert(
        "Błąd podczas tworzenia rezerwacji: " +
          (error instanceof Error ? error.message : "Nieznany błąd")
      );
    }
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    // Check if there are any reservations at this time
    const existingReservations = getReservationsForTimeSlot(date, hour);

    if (existingReservations.length === 0) {
      // Empty slot - open new reservation modal
      // add one day to date to account for timezone issues
      date.setDate(date.getDate() + 1);
      handleAddReservation(date, hour);
    } else {
      // Existing reservation - could open edit modal in the future
      console.log("Clicked on existing reservation:", existingReservations[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Week navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-lg font-semibold text-gray-900">
              {formatWeekRange()}
            </div>

            <button
              onClick={goToNextWeek}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200"
            >
              Dzisiaj
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleAddReservation()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowa rezerwacja
            </button>
          </div>
        </div>

        {/* Location filters */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filtruj według lokalizacji
            </h3>

            <button
              onClick={toggleAllLocations}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedLocations.size === locations.length
                ? "Ukryj wszystkie"
                : "Pokaż wszystkie"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {locations.map((location) => {
              const isSelected = selectedLocations.has(location.id);
              const locationReservations = weeklyReservations.filter(
                (r) => r.locationId === location.id
              ).length;

              return (
                <button
                  key={location.id}
                  onClick={() => toggleLocation(location.id)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {location.name}
                  <span className="ml-2 px-2 py-1 text-xs bg-white rounded-full">
                    {locationReservations}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda</h3>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Fizjoterapia</span>
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Trening personalny</span>
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Inne usługi</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header with day names */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-500">Godzina</span>
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-4 bg-gray-50 text-center">
              <div className="text-sm font-medium text-gray-900">
                {date.toLocaleDateString("pl-PL", { weekday: "short" })}
              </div>
              <div className="text-sm text-gray-600">
                {date.toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots and reservations */}
        <div className="divide-y divide-gray-100">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-8 min-h-[80px]">
              {/* Time column */}
              <div
                className={`p-3 border-r border-gray-200 flex items-start ${
                  slot.isDeadHour ? "bg-gray-50" : "bg-white"
                }`}
              >
                <span className="text-sm text-gray-600 font-mono">
                  {slot.label}
                </span>
                {slot.isDeadHour && (
                  <span className="ml-2 text-xs text-gray-500">martwe</span>
                )}
              </div>

              {/* Day columns */}
              {weekDates.map((date, dayIndex) => {
                const dayReservations = getReservationsForTimeSlot(
                  date,
                  slot.hour
                );

                return (
                  <div
                    key={dayIndex}
                    className={`p-1 border-r border-gray-100 ${
                      slot.isDeadHour ? "bg-gray-25" : "bg-white"
                    } hover:bg-blue-25 cursor-pointer transition-colors`}
                    onClick={() => handleTimeSlotClick(date, slot.hour)}
                  >
                    {dayReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`p-2 rounded-md text-xs border ${getServiceTypeColor(reservation.serviceType)} mb-1 transition-opacity ${
                          reservation.isLocationActive
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      >
                        <div className="font-medium truncate">
                          {reservation.clientName}
                        </div>
                        <div className="text-xs opacity-75">
                          {reservation.startTime.toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {reservation.endTime.toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {reservation.finalPrice} zł
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Podsumowanie tygodnia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {weeklyReservations.length}
            </div>
            <div className="text-sm text-gray-600">Liczba wizyt</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {weeklyReservations.reduce(
                (sum: number, res: Reservation) => sum + res.finalPrice,
                0
              )}{" "}
              zł
            </div>
            <div className="text-sm text-gray-600">Łączne zarobki</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {weeklyReservations
                .reduce((sum: number, res: Reservation) => {
                  const duration =
                    (res.endTime.getTime() - res.startTime.getTime()) /
                    (1000 * 60 * 60);
                  return sum + duration;
                }, 0)
                .toFixed(1)}{" "}
              h
            </div>
            <div className="text-sm text-gray-600">Godziny pracy</div>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        key={isNewReservationModalOpen ? "open" : "closed"} // Reset state on close
        isOpen={isNewReservationModalOpen}
        onClose={() => setIsNewReservationModalOpen(false)}
        onSubmit={handleNewReservationSubmit}
        employee={employee}
        locations={locations}
        rooms={rooms}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
      />
    </div>
  );
}
