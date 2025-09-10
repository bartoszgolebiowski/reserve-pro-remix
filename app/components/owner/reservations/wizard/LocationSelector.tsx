import { Building, MapPin } from "lucide-react";
import type { Location } from "~/lib/types";

interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId?: string;
  onLocationSelect: (locationId: string) => void;
}

export function LocationSelector({
  locations,
  selectedLocationId,
  onLocationSelect,
}: LocationSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wybierz Lokalizację
        </h2>
        <p className="text-gray-600">
          Wybierz lokalizację, w której chcesz utworzyć rezerwację
        </p>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak lokalizacji
          </h3>
          <p className="text-gray-600 mb-6">
            Najpierw musisz utworzyć lokalizację, aby móc tworzyć rezerwacje.
          </p>
          <a
            href="/dashboard/owner/locations"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Building className="w-5 h-5 mr-2" />
            Zarządzaj Lokalizacjami
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedLocationId === location.id}
              onClick={() => onLocationSelect(location.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-6 text-left rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${
          isSelected ? "bg-blue-100" : "bg-gray-100"
        }`}>
          <MapPin className={`w-6 h-6 ${
            isSelected ? "text-blue-600" : "text-gray-600"
          }`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            isSelected ? "text-blue-900" : "text-gray-900"
          }`}>
            {location.name}
          </h3>
          
          <div className="mt-2 space-y-1">
            <p className={`text-sm ${
              isSelected ? "text-blue-700" : "text-gray-600"
            }`}>
              {location.address}
            </p>
            <p className={`text-sm ${
              isSelected ? "text-blue-700" : "text-gray-600"
            }`}>
              {location.city}
            </p>
          </div>
          
          {isSelected && (
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <span className="font-medium">Wybrana lokalizacja</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
