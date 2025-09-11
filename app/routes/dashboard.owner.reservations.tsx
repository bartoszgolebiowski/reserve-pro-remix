import type { LoaderFunctionArgs } from "react-router";
import { Outlet, redirect, useLoaderData } from "react-router";
import { ReservationsDashboard } from "~/components/owner/reservations/dashboard/ReservationsDashboard";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";
import type { Reservation } from "~/lib/types";

export function meta() {
  return [
    { title: "Zarządzanie Rezerwacjami - Reserve Pro" },
    { name: "description", content: "Panel zarządzania rezerwacjami" },
  ];
}

/**
 * Loader - pobiera rezerwacje właściciela
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Pobierz dane użytkownika z sesji
  const sessionData = await authContainer.sessionService.getSession(request);
  if (!sessionData?.user) {
    throw redirect("/auth/login");
  }

  const ownerId = sessionData.user.id;
  
  // Sprawdź czy użytkownik to owner
  if (sessionData.user.role !== "OWNER") {
    throw new Error("Brak uprawnień do przeglądania rezerwacji");
  }

  try {
    // Pobierz rezerwacje właściciela
    const reservations = await reservationContainer.reservationService.getReservationsByOwnerId(ownerId);

    return {
      reservations,
    };
  } catch (error) {
    console.error("Error loading reservations:", error);
    // Zwróć pustą listę w przypadku błędu, żeby UI nie crashował
    return {
      reservations: [] as Reservation[],
    };
  }
}

export default function OwnerReservations() {
  const { reservations } = useLoaderData<typeof loader>();

  return (
    <>
      <ReservationsDashboard reservations={reservations} />
      <Outlet />
    </>
  );
}
