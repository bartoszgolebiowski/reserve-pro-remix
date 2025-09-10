/**
 * Rooms management component
 */
import { Calendar, Edit2, Home, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit
} from "react-router";
import type { Room } from "~/lib/types";

interface RoomsManagerProps {
  locationId: string;
  rooms: Room[];
}

export function RoomsManager({ locationId, rooms }: RoomsManagerProps) {
  const submit = useSubmit();
  const actionData = useActionData<{
    errors?: Record<string, string[]>;
    room?: Room;
    success?: boolean;
    error?: string;
  }>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const navigation = useNavigation();
  const navigate = useNavigate();

  // track previous navigation state so we can detect completion of a submit
  const prevNavStateRef = useRef(navigation.state);

  const selectRoom = (room: Room) => {
    navigate(`./${room.id}/occupancy`);
  };

  useEffect(() => {
    // if we were submitting and now are not, and action didn't return an error,
    // close the modal (this means create/update succeeded)
    if (
      prevNavStateRef.current === "submitting" &&
      navigation.state !== "submitting" &&
      !actionData?.errors &&
      (actionData?.room || actionData?.success)
    ) {
      setShowAddModal(false);
      setEditingRoom(null);
    }
    prevNavStateRef.current = navigation.state;
  }, [navigation.state, actionData]);

  const handleDelete = (roomId: string) => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć tę salę? Zostaną usunięte również wszystkie powiązane rezerwacje."
      )
    ) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("roomId", roomId);
      submit(formData, { method: "POST" });
    }
  };

  const getServiceTypeDisplay = (type: string) => {
    const map: Record<string, string> = {
      physiotherapy: "Fizjoterapia",
      personal_training: "Trening personalny",
      other: "Inne",
    };
    return map[type] || type;
  };

  const getServiceTypeColor = (type: string) => {
    const map: Record<string, string> = {
      physiotherapy: "bg-blue-100 text-blue-800",
      personal_training: "bg-green-100 text-green-800",
      other: "bg-gray-100 text-gray-800",
    };
    return map[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sale w tej lokalizacji
          </h2>
          <p className="text-gray-600">Zarządzaj salami w tej lokalizacji</p>
        </div>
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj salę</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pojemność: {room.capacity} os.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingRoom(room);
                      setShowAddModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Typy usług:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {room.serviceTypes.map((type) => (
                      <span
                        key={type}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(type)}`}
                      >
                        {getServiceTypeDisplay(type)}
                      </span>
                    ))}
                  </div>
                </div>

                {room.equipment && room.equipment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Wyposażenie:
                    </h4>
                    <div className="text-sm text-gray-600">
                      {room.equipment.slice(0, 3).map((item, index) => (
                        <span key={index}>
                          {item}
                          {index < Math.min(room.equipment!.length, 3) - 1 &&
                            ", "}
                        </span>
                      ))}
                      {room.equipment.length > 3 && (
                        <span className="text-gray-500">
                          {" "}
                          +{room.equipment.length - 3} więcej
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => selectRoom(room)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Zobacz obłożenie</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak sal</h3>
          <p className="text-gray-600 mb-4">
            Dodaj pierwszą salę w tej lokalizacji
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj salę</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRoom ? "Edytuj salę" : "Dodaj nową salę"}
            </h3>

            <Form method="post" className="space-y-4">
              <input
                type="hidden"
                name="intent"
                value={editingRoom ? "update" : "create"}
              />
              <input type="hidden" name="locationId" value={locationId} />
              {editingRoom && (
                <input type="hidden" name="roomId" value={editingRoom.id} />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa sali
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingRoom?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Sala Fizjoterapii 1"
                />
                {actionData?.errors?.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {actionData.errors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Typy usług
                </label>
                <div className="space-y-2">
                  {(
                    ["physiotherapy", "personal_training", "other"] as const
                  ).map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="serviceTypes"
                        value={type}
                        defaultChecked={editingRoom?.serviceTypes.includes(
                          type
                        )}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{getServiceTypeDisplay(type)}</span>
                    </label>
                  ))}
                </div>
                {actionData?.errors?.serviceTypes && (
                  <p className="text-red-600 text-sm mt-1">
                    {actionData.errors.serviceTypes[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pojemność (liczba osób)
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  max="20"
                  required
                  defaultValue={editingRoom?.capacity || 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {actionData?.errors?.capacity && (
                  <p className="text-red-600 text-sm mt-1">
                    {actionData.errors.capacity[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wyposażenie (oddziel przecinkami)
                </label>
                <textarea
                  name="equipment"
                  defaultValue={editingRoom?.equipment.join(", ")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Stół do masażu, Ultradźwięki, TENS, Hantele"
                  rows={3}
                />
                {actionData?.errors?.equipment && (
                  <p className="text-red-600 text-sm mt-1">
                    {actionData.errors.equipment[0]}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRoom ? "Zapisz" : "Dodaj"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
