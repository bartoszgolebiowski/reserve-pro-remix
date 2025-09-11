/**
 * Route: Harmonogram pracownika
 */
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { EmployeeScheduleView } from "~/components/employees/EmployeeScheduleView";
import { authContainer } from "~/lib/auth/container";
import { employeeContainer } from "~/lib/employee/container";
import { reservationContainer } from "~/lib/reservation/container";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const employeeId = params.employeeId!;

  // Sprawdź autoryzację
  const session = await authContainer.rbacService.requireOwner(request);
  const ownerId = session.user.id;

  try {
    // Pobierz dane pracownika i lokalizacje
    const [employee, locations] = await Promise.all([
      employeeContainer.employeeService.getEmployeeWithLocations(
        employeeId,
        ownerId
      ),
      reservationContainer.locationsRepo.getLocationsByOwnerId(ownerId),
    ]);

    if (!employee) {
      throw new Response("Pracownik nie został znaleziony", { status: 404 });
    }

    const reservations =
      await reservationContainer.reservationsRepo.getReservationsByEmployeeId(
        employeeId
      );

    // Ensure each reservation object includes `locationId` to match the shared Reservation type.
    // Some repos may omit it; fall back to the first location for the owner if missing.
    const reservationsWithLocation = reservations.map((r) => ({
      ...r,
      locationId: (r as any).locationId ?? (locations[0] && locations[0].id) ?? "",
    }));

    return {
      employee,
      reservations: reservationsWithLocation,
      locations: locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        ownerId: loc.ownerId,
      })),
    };
  } catch (error) {
    console.error("Error loading employee schedule:", error);
    throw new Response("Błąd podczas ładowania harmonogramu pracownika", {
      status: 500,
    });
  }
}

export default function DashboardOwnerEmployeesSchedule() {
  const { employee, reservations, locations } = useLoaderData<typeof loader>();

  return (
    <>
      <hr className="my-8" />
      <EmployeeScheduleView
        employee={employee}
        reservations={reservations}
        locations={locations}
      />
    </>
  );
}
