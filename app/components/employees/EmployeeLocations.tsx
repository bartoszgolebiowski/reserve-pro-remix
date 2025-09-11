import { DollarSign, MapPin } from "lucide-react";

interface LocationItem {
  locationId: string;
  locationName: string;
  hourlyRate: number;
}

interface Props {
  locations: LocationItem[];
}

export default function EmployeeLocations({ locations }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Lokalizacje i stawki:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {locations.map(location => (
          <div key={location.locationId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{location.locationName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">{location.hourlyRate} zł/h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
