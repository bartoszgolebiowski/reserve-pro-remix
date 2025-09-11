import {
  Clock,
  DollarSign,
  FileText,
  Mail,
  Phone,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Employee, Reservation, Room } from "~/lib/types";

interface RoomOccupancyViewProps {
  room: Room;
  locationName: string;
  reservations: Reservation[];
  employees: Employee[];
  onBack?: () => void;
}

export function RoomOccupancyView({
  room,
  locationName,
  reservations,
  employees,
}: RoomOccupancyViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [viewDay, setViewDay] = useState<Date>(new Date()); // Day selected for detailed view
  const [showAllWeek, setShowAllWeek] = useState(false); // State to toggle between daily and weekly view
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

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

  const getRoomReservations = (date: Date) => {
    const dateStr = date.toDateString();
    return reservations
      .filter(
        (reservation) =>
          reservation.roomId === room.id &&
          reservation.startTime.toDateString() === dateStr &&
          reservation.status !== "cancelled"
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : "Nieznany pracownik";
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

  // Funkcja do tworzenia siatki godzin dla kalendarza
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
      });
    }
    return slots;
  };

  // Funkcja do znajdowania rezerwacji dla konkretnej godziny
  const getReservationForTimeSlot = (date: Date, hour: number) => {
    const dayReservations = getRoomReservations(date);
    return dayReservations.filter(reservation => {
      const startHour = reservation.startTime.getHours();
      const endHour = reservation.endTime.getHours();
      const startMinutes = reservation.startTime.getMinutes();
      const endMinutes = reservation.endTime.getMinutes();
      
      // Sprawdzamy czy godzina mieści się w zakresie rezerwacji
      if (hour >= startHour && hour <= endHour) {
        // Jeśli to godzina rozpoczęcia, sprawdzamy minuty
        if (hour === startHour && startMinutes > 0) {
          return hour < endHour || (hour === endHour && endMinutes > 0);
        }
        // Jeśli to godzina zakończenia, sprawdzamy minuty
        if (hour === endHour && endMinutes === 0) {
          return false;
        }
        return true;
      }
      return false;
    });
  };

  // Funkcja do sprawdzenia czy rezerwacja zaczyna się w danej godzinie
  const isReservationStart = (reservation: Reservation, hour: number) => {
    return reservation.startTime.getHours() === hour;
  };

  // Funkcja do obliczenia wysokości bloku rezerwacji w siatce
  const getReservationHeight = (reservation: Reservation) => {
    const startHour = reservation.startTime.getHours();
    const endHour = reservation.endTime.getHours();
    const startMinutes = reservation.startTime.getMinutes();
    const endMinutes = reservation.endTime.getMinutes();
    
    const totalMinutes = (endHour * 60 + endMinutes) - (startHour * 60 + startMinutes);
    const hours = totalMinutes / 60;
    
    return Math.max(0.5, hours); // Minimum pół godziny wysokości
  };

  // Funkcja do obliczenia offsetu dla rezerwacji rozpoczynających się w środku godziny
  const getReservationOffset = (reservation: Reservation) => {
    const minutes = reservation.startTime.getMinutes();
    return (minutes / 60) * 60; // Offset w pikselach
  };

  // Główna funkcja renderująca kalendarz
  const renderCalendarView = () => {
    const timeSlots = generateTimeSlots();
    const datesToShow = showAllWeek ? weekDates : [viewDay];
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Nagłówek z datami */}
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

          {/* Siatka godzin i rezerwacji */}
          <div className="relative">
            {timeSlots.map((slot) => (
              <div key={slot.hour} className="grid grid-cols-[80px_1fr] border-b border-gray-100 min-h-[60px]">
                {/* Kolumna z godziną */}
                <div className="p-3 bg-gray-50 border-r border-gray-200 flex items-start">
                  <span className="text-sm text-gray-600 font-mono">{slot.label}</span>
                </div>
                
                {/* Kolumny z dniami */}
                <div className={`grid ${showAllWeek ? 'grid-cols-7' : 'grid-cols-1'} gap-0`}>
                  {datesToShow.map((date, dateIndex) => {
                    const reservationsInSlot = getReservationForTimeSlot(date, slot.hour);
                    
                    return (
                      <div
                        key={dateIndex}
                        className="border-r border-gray-200 last:border-r-0 p-1 relative min-h-[60px]"
                      >
                        {reservationsInSlot.map((reservation) => {
                          if (!isReservationStart(reservation, slot.hour)) {
                            return null; // Renderujemy tylko na początku rezerwacji
                          }
                          
                          const height = getReservationHeight(reservation);
                          const offset = getReservationOffset(reservation);
                          
                          return (
                            <div
                              key={reservation.id}
                              className={`absolute inset-x-1 ${getServiceTypeColor(reservation.serviceType)} rounded border-l-4 border-l-blue-500 p-2 text-xs z-10 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                              style={{
                                height: `${height * 60}px`,
                                top: `${offset}px`,
                                zIndex: 10
                              }}
                              onClick={() => setSelectedReservation(reservation)}
                              title={`Kliknij aby zobaczyć szczegóły - ${reservation.clientName}`}
                            >
                              <div className="font-medium mb-1 truncate">
                                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                              </div>
                              <div className="text-gray-700 mb-1 truncate">
                                {getEmployeeName(reservation.employeeId)}
                              </div>
                              <div className="text-gray-600 truncate">
                                {reservation.clientName}
                              </div>
                              <div className="text-gray-500 mt-1 truncate">
                                {getServiceTypeDisplay(reservation.serviceType)}
                              </div>
                              {reservation.finalPrice && (
                                <div className="text-green-600 font-medium mt-1">
                                  {reservation.finalPrice} zł
                                </div>
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
            <p className="text-gray-600">{locationName} • Obłożenie sali</p>
          </div>
        </div>

        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Dzisiaj
        </button>
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
            const dayReservations = getRoomReservations(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isSelected = date.toDateString() === viewDay.toDateString();

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
                </div>

                <div className="space-y-2">
                  {dayReservations.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">
                      Brak rezerwacji
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
                          {getEmployeeName(reservation.employeeId)}
                        </div>
                        <div className="text-gray-600">
                          {reservation.clientName}
                        </div>
                        <div className="text-gray-500 mt-1">
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

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Kalendarz rezerwacji
            </h3>
            <p className="text-gray-600">
              {showAllWeek
                ? "Kalendarz dla całego tygodnia"
                : `Kalendarz na ${formatDate(viewDay)}`}
            </p>
          </div>
          <button
            onClick={toggleWeekView}
            className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            {showAllWeek ? "Pokaż wybrany dzień" : "Pokaż cały tydzień"}
          </button>
        </div>

        <div className="p-4">
          {/* Legenda */}
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Legenda:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-xs text-gray-600">Fizjoterapia</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-xs text-gray-600">Trening personalny</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-xs text-gray-600">Inne</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Pasek boczny wskazuje aktywną rezerwację</span>
            </div>
          </div>
          
          {renderCalendarView()}
        </div>
      </div>

      {/* Modal ze szczegółami rezerwacji */}
      {selectedReservation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedReservation(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Szczegóły rezerwacji
                </h3>
                <button
                  onClick={() => setSelectedReservation(null)}
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
                      {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data</label>
                  <div className="text-sm mt-1">
                    {formatDate(selectedReservation.startTime)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Pracownik</label>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{getEmployeeName(selectedReservation.employeeId)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Klient</label>
                <div className="mt-1 space-y-1">
                  <div className="text-sm font-medium">{selectedReservation.clientName}</div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{selectedReservation.clientEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{selectedReservation.clientPhone}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Typ usługi</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeColor(selectedReservation.serviceType)}`}>
                      {getServiceTypeDisplay(selectedReservation.serviceType)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cena</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {selectedReservation.finalPrice} zł
                    </span>
                    {selectedReservation.isDeadHour && (
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedReservation.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : selectedReservation.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {selectedReservation.status === "confirmed"
                      ? "Potwierdzona"
                      : selectedReservation.status === "completed"
                        ? "Zakończona"
                        : "Anulowana"}
                  </span>
                </div>
              </div>

              {selectedReservation.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notatki</label>
                  <div className="flex items-start space-x-2 mt-1">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{selectedReservation.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
