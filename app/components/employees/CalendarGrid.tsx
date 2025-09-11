import type { Reservation } from "./types";

interface Props {
  weekDates: Date[];
  viewDay: Date;
  showAllWeek: boolean;
  generateTimeSlots: () => { hour: number; label: string }[];
  getReservationForTimeSlot: (date: Date, hour: number) => Reservation[];
  isReservationStart: (reservation: Reservation, hour: number) => boolean;
  getReservationHeight: (reservation: Reservation) => number;
  getReservationOffset: (reservation: Reservation) => number;
  getServiceTypeColor: (type: string) => string;
  formatTime: (d: Date) => string;
  getLocationName: (id: string) => string;
  getServiceTypeDisplay: (t: string) => string;
  setSelectedReservation: (r: Reservation) => void;
}

export default function CalendarGrid({
  weekDates,
  viewDay,
  showAllWeek,
  generateTimeSlots,
  getReservationForTimeSlot,
  isReservationStart,
  getReservationHeight,
  getReservationOffset,
  getServiceTypeColor,
  formatTime,
  getLocationName,
  getServiceTypeDisplay,
  setSelectedReservation,
}: Props) {
  const timeSlots = generateTimeSlots();
  const datesToShow = showAllWeek ? weekDates : [viewDay];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="grid grid-cols-[80px_1fr] border-b border-gray-200">
          <div className="p-3 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-600">Godzina</span>
          </div>
          <div className={`grid ${showAllWeek ? 'grid-cols-7' : 'grid-cols-1'} gap-0`}>
            {datesToShow.map((date, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border-r border-gray-200 last:border-r-0 text-center"
              >
                <div className="text-sm font-medium text-gray-900">
                  {date.toLocaleDateString("pl-PL", {
                    weekday: showAllWeek ? 'short' : 'long',
                    day: 'numeric',
                    month: showAllWeek ? 'short' : 'long'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-[80px_1fr] border-b border-gray-100 min-h-[60px]">
              <div className="p-3 bg-gray-50 border-r border-gray-200 flex items-start">
                <span className="text-sm text-gray-600 font-mono">{slot.label}</span>
              </div>

              <div className={`grid ${showAllWeek ? 'grid-cols-7' : 'grid-cols-1'} gap-0`}>
                {datesToShow.map((date, dateIndex) => {
                  const reservationsInSlot = getReservationForTimeSlot(date, slot.hour);

                  return (
                    <div
                      key={dateIndex}
                      className="border-r border-gray-200 last:border-r-0 p-1 relative min-h-[60px]"
                    >
                      {reservationsInSlot.map((reservation) => {
                        if (!isReservationStart(reservation, slot.hour)) return null;

                        const height = getReservationHeight(reservation);
                        const offset = getReservationOffset(reservation);

                        return (
                          <div
                            key={reservation.id}
                            className={`absolute inset-x-1 ${getServiceTypeColor(reservation.serviceType)} rounded border-l-4 border-l-blue-500 p-2 text-xs z-10 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                            style={{ height: `${height * 60}px`, top: `${offset}px`, zIndex: 10 }}
                            onClick={() => setSelectedReservation(reservation)}
                            title={`Kliknij aby zobaczyć szczegóły - ${reservation.clientName}`}
                          >
                            <div className="font-medium mb-1 truncate">
                              {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                            </div>
                            <div className="text-gray-700 mb-1 truncate">
                              {reservation.clientName}
                            </div>
                            <div className="text-gray-600 truncate">
                              {getLocationName(reservation.locationId)}
                            </div>
                            <div className="text-gray-500 mt-1 truncate">
                              {getServiceTypeDisplay(reservation.serviceType)}
                            </div>
                            {reservation.finalPrice && (
                              <div className="text-green-600 font-medium mt-1">{reservation.finalPrice} zł</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
