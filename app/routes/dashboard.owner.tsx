import { Calendar, MapPin, Users } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, Outlet } from "react-router";

export function meta() {
  return [
    { title: "Dashboard Właściciela - Reserve Pro" },
    { name: "description", content: "Panel zarządzania dla właściciela" },
  ];
}

/**
 * Loader - sprawdza status logowania użytkownika
 */
export async function loader({ request }: LoaderFunctionArgs) {}

export default function OwnerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel właściciela</h1>
        <p className="text-gray-600 mt-2">Zarządzaj swoim biznesem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Zarządzanie lokalizacjami */}
        <Link
          to="/dashboard/owner/locations"
          className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Lokalizacje
              </h3>
              <p className="text-gray-600 text-sm">
                Zarządzaj lokalizacjami i salami
              </p>
            </div>
          </div>
        </Link>

        {/* Zarządzanie pracownikami */}
        <div className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 opacity-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pracownicy
              </h3>
              <p className="text-gray-600 text-sm">Wkrótce dostępne</p>
            </div>
          </div>
        </div>

        {/* Rezerwacje */}
        <div className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 opacity-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rezerwacje
              </h3>
              <p className="text-gray-600 text-sm">Wkrótce dostępne</p>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
