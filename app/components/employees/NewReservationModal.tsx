import { Clock, DollarSign, MapPin, User, X } from "lucide-react";
import React, { useState } from "react";
import type { EmployeeLocation } from "./EmployeeCalendarView";

export interface Room {
  id: string;
  name: string;
  serviceTypes: string[];
  locationId: string;
}

export interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeType: "physiotherapist" | "personal_trainer";
  };
  locations: EmployeeLocation[];
  rooms: Room[];
  selectedDate?: Date;
  selectedHour?: number;
}

export interface ReservationFormData {
  locationId: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "physiotherapy" | "personal_training" | "other";
  date: string;
  startTime: string;
  duration: number; // in minutes
  notes: string;
}

export function NewReservationModal({
  isOpen,
  onClose,
  onSubmit,
  employee,
  locations,
  rooms,
  selectedDate,
  selectedHour,
}: NewReservationModalProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    locationId: locations[0]?.id || "",
    roomId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceType: employee.employeeType === "physiotherapist" ? "physiotherapy" : "personal_training",
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: selectedHour ? `${selectedHour.toString().padStart(2, '0')}:00` : "09:00",
    duration: 60,
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRooms = rooms.filter(room => 
    room.locationId === formData.locationId && 
    room.serviceTypes.includes(formData.serviceType)
  );

  const selectedLocation = locations.find(loc => loc.id === formData.locationId);

  // Calculate estimated price
  const calculateEstimatedPrice = () => {
    if (!selectedLocation) return 0;
    
    const hourlyRate = selectedLocation.hourlyRate;
    const hours = formData.duration / 60;
    const basePrice = hourlyRate * hours;
    
    // Check if it's dead hour (8:00-16:00)
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const isDeadHour = startHour >= 8 && startHour < 16;
    
    if (isDeadHour) {
      return basePrice * 0.8; // 20% discount for dead hours
    }
    
    return basePrice;
  };

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Imię i nazwisko klienta jest wymagane";
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = "Numer telefonu jest wymagany";
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Adres email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Nieprawidłowy format adresu email";
    }

    if (!formData.locationId) {
      newErrors.locationId = "Wybierz lokalizację";
    }

    if (!formData.roomId) {
      newErrors.roomId = "Wybierz salę";
    }

    if (!formData.date) {
      newErrors.date = "Wybierz datę";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Wybierz godzinę rozpoczęcia";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        locationId: locations[0]?.id || "",
        roomId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceType: employee.employeeType === "physiotherapist" ? "physiotherapy" : "personal_training",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        duration: 60,
        notes: "",
      });
    } catch (error) {
      console.error("Error creating reservation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'physiotherapy':
        return 'Fizjoterapia';
      case 'personal_training':
        return 'Trening personalny';
      default:
        return 'Inne';
    }
  };

  const availableServiceTypes = () => {
    if (employee.employeeType === "physiotherapist") {
      return [
        { value: "physiotherapy", label: "Fizjoterapia" },
        { value: "other", label: "Inne" }
      ];
    } else {
      return [
        { value: "personal_training", label: "Trening personalny" },
        { value: "other", label: "Inne" }
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Nowa rezerwacja
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Location and Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lokalizacja
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => {
                  handleInputChange('locationId', e.target.value);
                  // Reset room when location changes
                  handleInputChange('roomId', '');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.locationId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Wybierz lokalizację</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.city})
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sala
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.roomId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!formData.locationId}
              >
                <option value="">Wybierz salę</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
              )}
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ usługi
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => handleInputChange('serviceType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableServiceTypes().map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Godzina rozpoczęcia
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Czas trwania
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 minut</option>
                <option value={45}>45 minut</option>
                <option value={60}>1 godzina</option>
                <option value={75}>1,25 godziny</option>
                <option value={90}>1,5 godziny</option>
                <option value={120}>2 godziny</option>
              </select>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dane klienta
              </h3>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // fill with anonymous sample data and clear related errors
                    setFormData((prev) => ({
                      ...prev,
                      clientName: "Jan Nowak",
                      clientEmail: "jan.nowak@example.com",
                      clientPhone: "+48 123 456 789",
                    }));
                    setErrors((prev) => {
                      const next = { ...prev } as Record<string, string>;
                      delete next.clientName;
                      delete next.clientEmail;
                      delete next.clientPhone;
                      return next;
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
                >
                  Anonimowy użytkownik
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Jan Kowalski"
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+48 123 456 789"
                />
                {errors.clientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientPhone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="jan.kowalski@email.com"
              />
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notatki (opcjonalne)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dodatkowe informacje o rezerwacji..."
            />
          </div>

          {/* Price Preview */}
          {selectedLocation && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 flex items-center mb-2">
                <DollarSign className="w-4 h-4 mr-1" />
                Przewidywana cena
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Stawka godzinowa: {selectedLocation.hourlyRate} zł/h</div>
                <div>Czas trwania: {formData.duration} minut</div>
                <div className="text-lg font-semibold text-blue-600">
                  Łączna cena: {calculateEstimatedPrice().toFixed(2)} zł
                </div>
                {parseInt(formData.startTime.split(':')[0]) >= 8 && parseInt(formData.startTime.split(':')[0]) < 16 && (
                  <div className="text-sm text-amber-600">
                    * Uwzględniono zniżkę za martwe godziny (20%)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md"
            >
              {isLoading ? 'Tworzenie...' : 'Utwórz rezerwację'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}