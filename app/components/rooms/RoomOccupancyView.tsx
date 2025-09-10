import { ArrowLeft } from "lucide-react";
import type { Room } from "~/lib/types";

interface RoomOccupancyViewProps {
  room: Room;
  locationName: string;
  onBack: () => void;
}

export function RoomOccupancyView({ room, locationName, onBack }: RoomOccupancyViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {room.name}
          </h2>
          <p className="text-gray-600">{locationName}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Obłożenie sali
        </h3>
        <p className="text-gray-600">
          Ta funkcjonalność będzie dostępna wkrótce.
        </p>
      </div>
    </div>
  );
}
