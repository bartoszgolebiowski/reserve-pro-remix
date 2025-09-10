import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { RoomOccupancyView } from "~/components/rooms/RoomOccupancyView";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user } = await authContainer.rbacService.requireOwner(request);

  const { locationId, roomId } = params;

  if (!locationId) {
    throw new Response("Missing locationId", { status: 400 });
  }

  if (!roomId) {
    throw new Response("Missing roomId", { status: 400 });
  }

  // Pobieramy dane lokalizacji
  const location = await reservationContainer.locationsRepo.getLocationById(
    locationId,
    user.id
  );
  if (!location) {
    throw new Response("Location not found", { status: 404 });
  }

  // Pobieramy dane sali
  const room = await reservationContainer.roomsRepo.getRoomById(
    roomId,
    user.id
  );
  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  // Pobieramy rezerwacje dla sali z ReservationService
  // Obecnie pobieramy rezerwacje na cały bieżący tydzień
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Ustaw na początek tygodnia (niedziela)
  startOfWeek.setHours(0, 0, 0, 0);

  const reservations =
    await reservationContainer.reservationService.getWeeklyReservationsForRoom(
      roomId,
      startOfWeek
    );

  // Pobieramy pracowników przypisanych do lokalizacji
  const employees =
    await reservationContainer.employeesRepo.getEmployeesByLocation(locationId);

  return {
    room,
    location,
    locationName: location.name,
    reservations,
    employees,
  };
}

export default function RoomOccupancyRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <hr className="my-8" />
      <RoomOccupancyView
        room={data.room}
        locationName={data.locationName}
        reservations={data.reservations}
        employees={data.employees}
      />
    </>
  );
}
