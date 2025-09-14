import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { EmployeeCalendarView } from "~/components/employees/EmployeeCalendarView";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";

export function meta() {
  return [
    { title: "Kalendarz Pracownika - Reserve Pro" },
    { name: "description", content: "Zarządzaj swoim kalendarzem pracy i rezerwacjami" },
  ];
}

/**
 * Loader - sprawdza status logowania i pobiera dane pracownika
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Sprawdzenie czy użytkownik jest zalogowany jako pracownik
  const session = await authContainer.rbacService.requireWorker(request);

  if (!session?.user?.id) {
    throw redirect("/auth/login");
  }

  try {
    // Pobranie danych pracownika
    const employee = await reservationContainer.employeesRepo.getEmployeeById(session.user.id);
    
    if (!employee) {
      throw new Response("Profil pracownika nie został znaleziony", { status: 404 });
    }

    // Pobranie lokalizacji pracownika z pełnymi danymi
    const locations = await reservationContainer.employeesRepo.getEmployeeLocationsWithDetails(session.user.id);

    // Pobranie sal dla lokalizacji pracownika
    const rooms = await reservationContainer.roomsRepo.getRoomsByEmployeeId(session.user.id);

    // Pobranie rezerwacji na bieżący tydzień
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Niedziela
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sobota
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyReservations = await reservationContainer.reservationsRepo.getReservationsByEmployeeIdAndDateRange(
      session.user.id,
      startOfWeek,
      endOfWeek
    );

    // Add locationId to reservations by looking up room location
    const reservationsWithLocation = await Promise.all(
      weeklyReservations.map(async (reservation) => {
        try {
          // Find the room for this reservation and get its locationId
          const room = rooms.find(room => room.id === reservation.roomId);
          const locationId = room?.locationId || (locations.length > 0 ? locations[0].id : "");
          
          return {
            ...reservation,
            locationId,
          };
        } catch (error) {
          console.error("Error getting room location:", error);
          return {
            ...reservation,
            locationId: locations.length > 0 ? locations[0].id : "",
          };
        }
      })
    );

    return {
      employee,
      locations,
      rooms,
      reservations: reservationsWithLocation,
      currentWeek: startOfWeek,
    };
  } catch (error) {
    console.error("Error loading employee dashboard:", error);
    throw new Response("Błąd podczas ładowania danych pracownika", {
      status: 500,
    });
  }
}

export default function EmployeeDashboard() {
  const { employee, locations, rooms, reservations, currentWeek } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Witaj, {employee.firstName} {employee.lastName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Zarządzaj swoim kalendarzem pracy i rezerwacjami
          </p>
        </div>

        {/* Employee Calendar */}
        <EmployeeCalendarView
          employee={employee}
          locations={locations}
          rooms={rooms}
          reservations={reservations}
          currentWeek={currentWeek}
        />
      </div>
    </div>
  );
}
