import { Clock, DollarSign, FileText, Mail, MapPin, Phone } from "lucide-react";
import type { Reservation } from "./types";

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  formatTime: (d: Date) => string;
  formatDate: (d: Date) => string;
  getLocationName: (id: string) => string;
  getServiceTypeDisplay: (t: string) => string;
  getServiceTypeColor: (t: string) => string;
}

export default function ReservationModal({
  reservation,
  onClose,
  formatTime,
  formatDate,
  getLocationName,
  getServiceTypeDisplay,
  getServiceTypeColor,
}: Props) {
  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Szczegóły wizyty
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Czas</label>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {formatTime(reservation.startTime)} -{" "}
                  {formatTime(reservation.endTime)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data</label>
              <div className="text-sm mt-1">
                {formatDate(reservation.startTime)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Lokalizacja
            </label>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {getLocationName(reservation.locationId)}
              </span>
            </div>
            {reservation.roomName && (
              <div className="text-sm text-gray-600 mt-1">
                Sala: {reservation.roomName}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Klient</label>
            <div className="mt-1 space-y-1">
              <div className="text-sm font-medium">
                {reservation.clientName}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-3 h-3" />
                <span>{reservation.clientEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{reservation.clientPhone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Typ usługi
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(reservation.serviceType)}`}
                >
                  {getServiceTypeDisplay(reservation.serviceType)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cena</label>
              <div className="flex items-center space-x-2 mt-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {reservation.finalPrice} zł
                </span>
                {reservation.isDeadHour && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Martwa godzina
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${reservation.status === "confirmed" ? "bg-green-100 text-green-800" : reservation.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
              >
                {reservation.status === "confirmed"
                  ? "Potwierdzona"
                  : reservation.status === "completed"
                    ? "Zakończona"
                    : "Anulowana"}
              </span>
            </div>
          </div>

          {reservation.notes && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Notatki
              </label>
              <div className="flex items-start space-x-2 mt-1">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {reservation.notes}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
