/**
 * Rooms management component (placeholder for future implementation)
 */
import { Home, Plus } from 'lucide-react';
import type { Room } from '~/lib/types';

interface RoomsManagerProps {
  locationId: string;
  locationName: string;
  rooms?: Room[];
}

export function RoomsManager({ locationId, locationName, rooms = [] }: RoomsManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Sale w lokalizacji: {locationName}
        </h2>
        <button
          onClick={() => alert('Dodawanie sal będzie wkrótce dostępne!')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj salę</span>
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak sal</h3>
          <p className="text-gray-600 mb-4">
            Ta funkcjonalność będzie dostępna w przyszłych wersjach
          </p>
          <button
            onClick={() => alert('Dodawanie sal będzie wkrótce dostępne!')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj pierwszą salę</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Pojemność: {room.capacity} osób</div>
                <div>Usługi: {room.serviceTypes.join(', ') || 'Brak'}</div>
                <div>Wyposażenie: {room.equipment.join(', ') || 'Brak'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
