/**
 * Route: Harmonogram pracownika
 */
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { EmployeeScheduleView } from "~/components/employees/EmployeeScheduleView";
import { authContainer } from "~/lib/auth/container";
import { employeeContainer } from "~/lib/employee/container";
import { reservationContainer } from "~/lib/reservation/container";

// TODO: Replace with proper types when reservation types are available
interface Reservation {
  id: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  status: "confirmed" | "completed" | "cancelled";
  finalPrice: number;
  isDeadHour?: boolean;
  notes?: string;
  locationId: string;
  roomId?: string;
  roomName?: string;
}

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

    return {
      employee,
      reservations,
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
