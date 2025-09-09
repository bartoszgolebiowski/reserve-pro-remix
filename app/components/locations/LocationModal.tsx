/**
 * Modal component for adding/editing locations
 */
import { Form } from "react-router";
import type { Location } from "~/lib/types";

interface LocationModalProps {
  location?: Location | null;
  onClose: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function LocationModal({ location, onClose, isSubmitting, error }: LocationModalProps) {
  const isEditing = !!location;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edytuj lokalizację' : 'Dodaj nową lokalizację'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value={isEditing ? "update" : "create"} />
          {isEditing && (
            <input type="hidden" name="locationId" value={location.id} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa lokalizacji
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={location?.name || ''}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="np. SportMed Centrum"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres
            </label>
            <input
              type="text"
              name="address"
              required
              defaultValue={location?.address || ''}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="ul. Sportowa 15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miasto
            </label>
            <input
              type="text"
              name="city"
              required
              defaultValue={location?.city || ''}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Warszawa"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Zapisywanie...' : (isEditing ? 'Zapisz' : 'Dodaj')}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
