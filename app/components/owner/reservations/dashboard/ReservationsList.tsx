import { Calendar, Plus } from "lucide-react";
import { Link } from "react-router";
import type { Reservation } from "~/lib/types";
import { ReservationCard } from "./ReservationCard";

interface ReservationsListProps {
  reservations: Reservation[];
}

export function ReservationsList({ reservations }: ReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ostatnie Rezerwacje
          </h2>
        </div>
        
        <div className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak rezerwacji
          </h3>
          <p className="text-gray-600 mb-6">
            Rozpocznij od utworzenia pierwszej rezerwacji dla swoich klientów.
          </p>
          <Link
            to="/dashboard/owner/reservations/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Utwórz pierwszą rezerwację
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Ostatnie Rezerwacje
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {reservations.slice(0, 10).map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
}
