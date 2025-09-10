import { Calendar, Plus } from "lucide-react";
import { Link } from "react-router";
import type { Reservation } from "~/lib/types";
import { ReservationsList } from "./ReservationsList";
import { ReservationStats } from "./ReservationStats";


interface ReservationsDashboardProps {
  reservations: Reservation[];
}

export function ReservationsDashboard({ reservations }: ReservationsDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Zarządzanie Rezerwacjami
            </h1>
            <p className="text-gray-600 mt-1">
              Twórz i zarządzaj rezerwacjami w swoich lokalizacjach
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/owner/reservations/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nowa Rezerwacja
        </Link>
      </div>

      {/* Stats */}
      <ReservationStats reservations={reservations} />

      {/* Reservations List */}
      <ReservationsList reservations={reservations} />
    </div>
  );
}
