/**
 * Main component for managing locations
 */
import { ArrowRight, Edit2, Home, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Location, LocationWithRoomCount } from "~/lib/types";
import { EmptyLocationsState } from "./EmptyLocationsState";
import { LocationModal } from "./LocationModal";

interface LocationsManagerProps {
  locations: LocationWithRoomCount[];
}

export function LocationsManager({ locations }: LocationsManagerProps) {
  const navigation = useNavigation();
  const actionData = useActionData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const isSubmitting = navigation.state === "submitting";

  // track previous navigation state so we can detect completion of a submit
  const prevNavStateRef = useRef(navigation.state);

  useEffect(() => {
    // if we were submitting and now are not, and action didn't return an error,
    // close the modal (this means create/update succeeded)
    if (
      prevNavStateRef.current === "submitting" &&
      navigation.state !== "submitting"
    ) {
      if (!actionData?.error) {
        setShowAddModal(false);
        setEditingLocation(null);
      }
    }
    prevNavStateRef.current = navigation.state;
  }, [navigation.state, actionData]);

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowAddModal(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingLocation(null);
  };

  const handleManageRooms = (location: Location) => {
    window.location.href = `/dashboard/owner/locations/${location.id}/rooms`;
  };

  if (locations.length === 0) {
    return (
      <>
        {showAddModal && (
          <LocationModal
            onClose={handleCloseModal}
            isSubmitting={isSubmitting}
            error={actionData?.error}
          />
        )}
        <EmptyLocationsState onAddLocation={handleAddNew} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Zarządzanie lokalizacjami
        </h2>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj lokalizację</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-600">{location.city}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edytuj lokalizację"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input
                      type="hidden"
                      name="locationId"
                      value={location.id}
                    />
                    <button
                      type="submit"
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Usuń lokalizację"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Czy na pewno chcesz usunąć tę lokalizację? Zostaną usunięte również wszystkie powiązane sale."
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>{location.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Sale:</span>
                <span className="font-medium">{location.roomCount}</span>
              </div>

              <button
                onClick={() => handleManageRooms(location)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Zarządzaj salami</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {showAddModal && (
        <LocationModal
          location={editingLocation}
          onClose={handleCloseModal}
          isSubmitting={isSubmitting}
          error={actionData?.error}
        />
      )}
    </div>
  );
}
