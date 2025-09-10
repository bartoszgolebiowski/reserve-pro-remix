import { Building, Calendar, CheckCircle, Clock, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import type { Employee, Location, OwnerReservationFormData, Room } from "~/lib/types";

interface ReservationSummaryProps {
  formData: OwnerReservationFormData;
  locations: Location[];
  rooms: Room[];
  employees: Employee[];
  onSubmit: () => void;
}

export function ReservationSummary({
  formData,
  locations,
  rooms,
  employees,
  onSubmit,
}: ReservationSummaryProps) {
  const location = locations.find(l => l.id === formData.locationId);
  const room = rooms.find(r => r.id === formData.roomId);
  const employee = employees.find(e => e.id === formData.employeeId);

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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  };

  const calculateDuration = () => {
    const diff = formData.endTime.getTime() - formData.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours} godz. ${minutes} min.`;
    } else if (hours > 0) {
      return `${hours} godz.`;
    } else {
      return `${minutes} min.`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Podsumowanie Rezerwacji
        </h2>
        <p className="text-gray-600">
          Sprawdź szczegóły rezerwacji przed zatwierdzeniem
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location and Room */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Miejsce
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Lokalizacja:</span>
              <p className="text-gray-900">
                {location?.name || "Nieznana lokalizacja"}
              </p>
              <p className="text-sm text-gray-600">
                {location?.address}, {location?.city}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Sala:</span>
              <p className="text-gray-900 flex items-center">
                <Building className="w-4 h-4 mr-1 text-gray-400" />
                {room?.name || "Nieznana sala"}
              </p>
              {room && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {room.serviceTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {getServiceTypeName(type)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-green-600" />
            Pracownik
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Imię i nazwisko:</span>
              <p className="text-gray-900">
                {employee ? `${employee.firstName} ${employee.lastName}` : "Nieznany pracownik"}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Typ:</span>
              <p className="text-gray-900">
                {employee?.employeeType === "physiotherapist" && "Fizjoterapeuta"}
                {employee?.employeeType === "personal_trainer" && "Trener personalny"}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-900 text-sm">
                {employee?.email || "Brak emaila"}
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Klient
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Imię i nazwisko:</span>
              <p className="text-gray-900">{formData.clientName}</p>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900 text-sm">{formData.clientEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-500">Telefon:</span>
                <p className="text-gray-900 text-sm">{formData.clientPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service and Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-600" />
            Termin i Usługa
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Rodzaj usługi:</span>
              <p className="text-gray-900">{getServiceTypeName(formData.serviceType)}</p>
            </div>
            
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2 text-gray-400 mt-1" />
              <div className="space-y-1">
                <div>
                  <span className="text-sm font-medium text-gray-500">Rozpoczęcie:</span>
                  <p className="text-gray-900 text-sm">{formatDateTime(formData.startTime)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Zakończenie:</span>
                  <p className="text-gray-900 text-sm">{formatDateTime(formData.endTime)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Czas trwania:</span>
                  <p className="text-gray-900 text-sm font-medium">{calculateDuration()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Dodatkowe Notatki
          </h3>
          <p className="text-gray-700">{formData.notes}</p>
        </div>
      )}

      {/* Pricing Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Informacje o Cenie
        </h3>
        <p className="text-blue-700 text-sm">
          Cena zostanie automatycznie obliczona na podstawie konfiguracji cennika, 
          typu usługi, czasu trwania i stawki pracownika.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={onSubmit}
          className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          Potwierdź i Utwórz Rezerwację
        </button>
      </div>
    </div>
  );
}
