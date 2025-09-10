import type { Reservation } from "~/lib/types";

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Potwierdzona",
          className: "bg-green-100 text-green-800"
        };
      case "cancelled":
        return {
          label: "Anulowana",
          className: "bg-red-100 text-red-800"
        };
      case "completed":
        return {
          label: "Zakończona",
          className: "bg-gray-100 text-gray-800"
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800"
        };
    }
  };

  const statusInfo = getStatusInfo(reservation.status);

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {reservation.clientName}
              </h4>
              <p className="text-gray-600">
                {getServiceTypeName(reservation.serviceType)}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Data:</span>{" "}
              {new Date(reservation.startTime).toLocaleDateString("pl-PL")}
            </div>
            <div>
              <span className="font-medium">Godzina:</span>{" "}
              {new Date(reservation.startTime).toLocaleTimeString("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(reservation.endTime).toLocaleTimeString("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div>
              <span className="font-medium">Cena:</span>{" "}
              {reservation.finalPrice.toFixed(2)} zł
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
}
