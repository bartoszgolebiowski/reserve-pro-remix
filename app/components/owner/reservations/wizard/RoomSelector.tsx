import { Building, Users, Wrench } from "lucide-react";
import type { Room } from "~/lib/types";

interface RoomSelectorProps {
  locationId: string;
  rooms: Room[];
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
}

export function RoomSelector({
  locationId,
  rooms,
  selectedRoomId,
  onRoomSelect,
}: RoomSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wybierz Salę
        </h2>
        <p className="text-gray-600">
          Wybierz salę, w której odbędzie się rezerwacja
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak sal w tej lokalizacji
          </h3>
          <p className="text-gray-600 mb-6">
            W wybranej lokalizacji nie ma jeszcze żadnych sal. 
            Dodaj sale aby móc tworzyć rezerwacje.
          </p>
          <a
            href={`/dashboard/owner/locations/${locationId}/rooms`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Building className="w-5 h-5 mr-2" />
            Zarządzaj Salami
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              onClick={() => onRoomSelect(room.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onClick: () => void;
}

function RoomCard({ room, isSelected, onClick }: RoomCardProps) {
  const getServiceTypeName = (type: string) => {
    switch (type) {
      case "physiotherapy":
        return "Fizjoterapia";
      case "personal_training":
        return "Trening personalny";
      case "other":
        return "Inne";
      default:
        return type;
    }
  };

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
          <Building className={`w-6 h-6 ${
            isSelected ? "text-blue-600" : "text-gray-600"
          }`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            isSelected ? "text-blue-900" : "text-gray-900"
          }`}>
            {room.name}
          </h3>
          
          <div className="mt-3 space-y-2">
            {/* Capacity */}
            <div className="flex items-center space-x-2">
              <Users className={`w-4 h-4 ${
                isSelected ? "text-blue-600" : "text-gray-500"
              }`} />
              <span className={`text-sm ${
                isSelected ? "text-blue-700" : "text-gray-600"
              }`}>
                Pojemność: {room.capacity} osób
              </span>
            </div>

            {/* Service Types */}
            <div className="space-y-1">
              <span className={`text-sm font-medium ${
                isSelected ? "text-blue-700" : "text-gray-700"
              }`}>
                Rodzaje usług:
              </span>
              <div className="flex flex-wrap gap-1">
                {room.serviceTypes.map((type) => (
                  <span
                    key={type}
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      isSelected
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getServiceTypeName(type)}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment */}
            {room.equipment.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Wrench className={`w-4 h-4 ${
                    isSelected ? "text-blue-600" : "text-gray-500"
                  }`} />
                  <span className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}>
                    Wyposażenie:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {room.equipment.slice(0, 3).map((equipment) => (
                    <span
                      key={equipment}
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {equipment}
                    </span>
                  ))}
                  {room.equipment.length > 3 && (
                    <span className={`text-xs ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}>
                      +{room.equipment.length - 3} więcej
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {isSelected && (
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <span className="font-medium">Wybrana sala</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
