import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { ReservationsDashboard } from "~/components/owner/reservations/dashboard/ReservationsDashboard";
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
  // TODO: Implement authentication and get owner reservations
  const reservations: Reservation[] = [];

  return {
    reservations,
  };
}

export default function OwnerReservations() {
  const { reservations } = useLoaderData<typeof loader>();

  return (
    <>
      <ReservationsDashboard reservations={reservations} />
      <hr className="my-8" />
      <Outlet />
    </>
  );
}
