import type { Reservation } from "~/lib/types";

interface ReservationStatsProps {
  reservations: Reservation[];
}

export function ReservationStats({ reservations }: ReservationStatsProps) {
  const todayReservations = reservations.filter((r) => {
    const today = new Date();
    const reservationDate = new Date(r.startTime);
    return reservationDate.toDateString() === today.toDateString();
  }).length;

  const weekReservations = reservations.filter((r) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const reservationDate = new Date(r.startTime);
    return reservationDate >= weekStart && reservationDate < weekEnd;
  }).length;

  const activeReservations = reservations.filter((r) => r.status === "confirmed").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Dzisiaj
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          {todayReservations}
        </p>
        <p className="text-gray-600 text-sm mt-1">Rezerwacji</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ten tydzień
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {weekReservations}
        </p>
        <p className="text-gray-600 text-sm mt-1">Rezerwacji</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aktywne
        </h3>
        <p className="text-3xl font-bold text-orange-600">
          {activeReservations}
        </p>
        <p className="text-gray-600 text-sm mt-1">Potwierdzone</p>
      </div>
    </div>
  );
}
