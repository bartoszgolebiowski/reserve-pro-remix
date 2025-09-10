import {
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Mail,
    MapPin,
    Phone,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { EmployeeWithLocations, Location } from "~/lib/employee/types/employee.types";

// TODO: Import proper types when available
interface Reservation {
  id: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  status: "confirmed" | "completed" | "cancelled";
  finalPrice: number;
  isDeadHour?: boolean;
  notes?: string;
  locationId: string;
  roomId?: string;
  roomName?: string;
}

interface EmployeeScheduleViewProps {
  employee: EmployeeWithLocations;
  reservations: Reservation[];
  locations: Location[];
  onBack?: () => void;
}

export function EmployeeScheduleView({
  employee,
  reservations,
  locations,
}: EmployeeScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [viewDay, setViewDay] = useState<Date>(new Date()); // Day selected for detailed view
  const [showAllWeek, setShowAllWeek] = useState(false); // State to toggle between daily and weekly view

  useEffect(() => {
    // Generowanie dat tygodnia zaczynając od poniedziałku
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, [selectedDate]);

  // Gdy zmienia się tydzień, ustawiamy wybrany dzień na pierwszy dzień tygodnia
  useEffect(() => {
    if (weekDates.length > 0) {
      const today = new Date();
      // Jeśli dzisiejszy dzień jest w zakresie tygodnia, wybieramy go, w przeciwnym razie wybieramy pierwszy dzień tygodnia
      const todayInWeek = weekDates.find(
        (date) => date.toDateString() === today.toDateString()
      );
      setViewDay(todayInWeek || weekDates[0]);
    }
  }, [weekDates]);

  const getEmployeeReservations = (date: Date) => {
    const dateStr = date.toDateString();
    return reservations
      .filter(
        (reservation) =>
          reservation.startTime.toDateString() === dateStr &&
          reservation.status !== "cancelled"
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : "Nieznana lokalizacja";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
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
      physiotherapy: "bg-blue-100 text-blue-800 border-blue-200",
      personal_training: "bg-green-100 text-green-800 border-green-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return map[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getEmployeeTypeDisplay = (type: string) => {
    return type === 'physiotherapist' ? 'Fizjoterapeuta' : 'Trener personalny';
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setViewDay(new Date());
  };

  const selectDay = (date: Date) => {
    setViewDay(date);
    setShowAllWeek(false); // Switch to daily view when selecting a day
  };

  const toggleWeekView = () => {
    setShowAllWeek(!showAllWeek);
  };

  // Calculate weekly stats
  const weeklyReservations = weekDates.flatMap(date => getEmployeeReservations(date));
  const weeklyEarnings = weeklyReservations.reduce((sum, res) => sum + res.finalPrice, 0);
  const weeklyHours = weeklyReservations.reduce((sum, res) => {
    const duration = (res.endTime.getTime() - res.startTime.getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-100 rounded-lg">
            <User className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-600">
              {getEmployeeTypeDisplay(employee.employeeType)} • Harmonogram pracy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Ten tydzień</div>
            <div className="text-lg font-semibold text-gray-900">
              {weeklyEarnings.toFixed(2)} zł
            </div>
            <div className="text-xs text-gray-500">
              {weeklyHours.toFixed(1)}h • {weeklyReservations.length} wizyt
            </div>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dzisiaj
          </button>
        </div>
      </div>

      {/* Employee Locations Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lokalizacje i stawki:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employee.locations.map(location => (
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

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Poprzedni tydzień
          </button>

          <h3 className="text-lg font-semibold text-gray-900">
            {weekDates.length > 0 &&
              `${weekDates[0].toLocaleDateString("pl-PL", { day: "numeric", month: "long" })} - 
               ${weekDates[6].toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}`}
          </h3>

          <button
            onClick={() => navigateWeek("next")}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Następny tydzień →
          </button>
        </div>

        {/* Week Calendar */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayReservations = getEmployeeReservations(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isSelected = date.toDateString() === viewDay.toDateString();
            const dayEarnings = dayReservations.reduce((sum, res) => sum + res.finalPrice, 0);

            return (
              <div
                key={index}
                onClick={() => selectDay(date)}
                className={`border rounded-lg p-3 min-h-[200px] transition-all cursor-pointer hover:border-blue-400 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : isWeekend
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-center mb-3">
                  <div
                    className={`text-sm font-medium ${
                      isSelected ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {date
                      .toLocaleDateString("pl-PL", { weekday: "short" })
                      .toUpperCase()}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {dayEarnings > 0 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {dayEarnings.toFixed(0)} zł
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {dayReservations.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">
                      Brak wizyt
                    </div>
                  ) : (
                    dayReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`p-2 rounded border text-xs ${getServiceTypeColor(reservation.serviceType)}`}
                      >
                        <div className="font-medium mb-1">
                          {formatTime(reservation.startTime)} -{" "}
                          {formatTime(reservation.endTime)}
                        </div>
                        <div className="text-gray-700 mb-1">
                          {reservation.clientName}
                        </div>
                        <div className="text-gray-600 mb-1">
                          {getLocationName(reservation.locationId)}
                        </div>
                        <div className="text-gray-500">
                          {getServiceTypeDisplay(reservation.serviceType)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Reservations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Szczegóły wizyt
            </h3>
            <p className="text-gray-600">
              {showAllWeek
                ? "Wszystkie wizyty w bieżącym tygodniu"
                : `Wizyty na ${formatDate(viewDay)}`}
            </p>
          </div>
          <button
            onClick={toggleWeekView}
            className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            {showAllWeek ? "Pokaż wybrany dzień" : "Pokaż cały tydzień"}
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {(showAllWeek ? weekDates : [viewDay]).map((date) => {
            const dayReservations = getEmployeeReservations(date);

            if (dayReservations.length === 0) {
              // Only show empty state message for the selected day in single day view
              if (!showAllWeek) {
                return (
                  <div key={date.toISOString()} className="p-6 text-center">
                    <p className="text-gray-500 py-8">
                      Brak wizyt na ten dzień
                    </p>
                  </div>
                );
              }
              return null;
            }

            return (
              <div key={date.toISOString()} className="p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4 capitalize">
                  {formatDate(date)}
                </h4>

                <div className="space-y-4">
                  {dayReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {formatTime(reservation.startTime)} -{" "}
                              {formatTime(reservation.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{getLocationName(reservation.locationId)}</span>
                          </div>
                          {reservation.roomName && (
                            <div className="text-sm text-gray-600 mb-2">
                              Sala: {reservation.roomName}
                            </div>
                          )}
                          <div
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(reservation.serviceType)}`}
                          >
                            {getServiceTypeDisplay(reservation.serviceType)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Klient:
                          </div>
                          <div className="font-medium mb-2">
                            {reservation.clientName}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                            <Mail className="w-3 h-3" />
                            <span>{reservation.clientEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{reservation.clientPhone}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              {reservation.finalPrice} zł
                            </span>
                            {reservation.isDeadHour && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Martwa godzina
                              </span>
                            )}
                          </div>
                          <div
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              reservation.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.status === "confirmed"
                              ? "Potwierdzona"
                              : reservation.status === "completed"
                                ? "Zakończona"
                                : "Anulowana"}
                          </div>
                          {reservation.notes && (
                            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                              <FileText className="w-3 h-3" />
                              <span>Ma notatki</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {weekDates.every((date) => getEmployeeReservations(date).length === 0) && (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak wizyt
            </h3>
            <p className="text-gray-600">
              W tym tygodniu {employee.firstName} nie ma żadnych zaplanowanych wizyt
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
