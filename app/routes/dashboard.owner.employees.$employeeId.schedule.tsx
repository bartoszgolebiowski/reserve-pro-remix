/**
 * Route: Harmonogram pracownika
 */
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { EmployeeScheduleView } from "~/components/employees/EmployeeScheduleView";
import { authContainer } from "~/lib/auth/container";
import { employeeContainer } from "~/lib/employee/container";
import type {
  EmployeeWithLocations,
  Location,
} from "~/lib/employee/types/employee.types";
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

type LoaderData = {
  employee: EmployeeWithLocations;
  reservations: Reservation[];
  locations: Location[];
};

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

    // TODO: Pobierz rezerwacje pracownika z bazy danych
    // Na razie zwracamy przykładowe dane do demonstracji
    const reservations: Reservation[] = [
      {
        id: "1",
        startTime: new Date(2025, 8, 10, 9, 0), // 10 września 2025, 9:00
        endTime: new Date(2025, 8, 10, 10, 0), // 10:00
        clientName: "Jan Kowalski",
        clientEmail: "jan.kowalski@email.com",
        clientPhone: "+48 123 456 789",
        serviceType: "physiotherapy",
        status: "confirmed",
        finalPrice: 120,
        locationId: locations[0]?.id || "loc1",
        roomId: "room1",
        roomName: "Sala rehabilitacyjna 1",
        notes: "Pierwsza wizyta - diagnostyka",
      },
      {
        id: "2",
        startTime: new Date(2025, 8, 10, 14, 0), // 14:00
        endTime: new Date(2025, 8, 10, 15, 30), // 15:30
        clientName: "Anna Nowak",
        clientEmail: "anna.nowak@email.com",
        clientPhone: "+48 987 654 321",
        serviceType: "personal_training",
        status: "confirmed",
        finalPrice: 150,
        locationId: locations[0]?.id || "loc1",
        roomId: "room2",
        roomName: "Siłownia",
        isDeadHour: false,
      },
      {
        id: "3",
        startTime: new Date(2025, 8, 11, 10, 0), // 11 września, 10:00
        endTime: new Date(2025, 8, 11, 11, 0), // 11:00
        clientName: "Piotr Zieliński",
        clientEmail: "piotr.zielinski@email.com",
        clientPhone: "+48 111 222 333",
        serviceType: "physiotherapy",
        status: "completed",
        finalPrice: 120,
        locationId: locations[0]?.id || "loc1",
        roomId: "room1",
        roomName: "Sala rehabilitacyjna 1",
      },
    ];
    // const reservations = await reservationContainer.reservationsRepo.getReservationsByEmployeeId(employeeId);

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
