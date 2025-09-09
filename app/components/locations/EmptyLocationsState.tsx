/**
 * Empty state component for locations
 */
import { MapPin, Plus } from 'lucide-react';

interface EmptyLocationsStateProps {
  onAddLocation: () => void;
}

export function EmptyLocationsState({ onAddLocation }: EmptyLocationsStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Brak lokalizacji</h3>
      <p className="text-gray-600 mb-4">Dodaj pierwszą lokalizację, aby rozpocząć zarządzanie</p>
      <button
        onClick={onAddLocation}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Dodaj lokalizację</span>
      </button>
    </div>
  );
}
