import { Calendar, Clock, FileText, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import type { OwnerReservationFormData } from "~/lib/types";

interface ReservationFormProps {
  formData: Partial<OwnerReservationFormData>;
  onSubmit: (data: Partial<OwnerReservationFormData>) => void;
}

export function ReservationForm({ formData, onSubmit }: ReservationFormProps) {
  const [localData, setLocalData] = useState({
    clientName: formData.clientName || "",
    clientEmail: formData.clientEmail || "",
    clientPhone: formData.clientPhone || "",
    serviceType: formData.serviceType || "physiotherapy",
    startTime: formData.startTime ? formatDateTimeLocal(formData.startTime) : "",
    endTime: formData.endTime ? formatDateTimeLocal(formData.endTime) : "",
    notes: formData.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!localData.clientName.trim()) {
      newErrors.clientName = "Imię i nazwisko klienta jest wymagane";
    }

    if (!localData.clientEmail.trim()) {
      newErrors.clientEmail = "Email jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.clientEmail)) {
      newErrors.clientEmail = "Nieprawidłowy format emaila";
    }

    if (!localData.clientPhone.trim()) {
      newErrors.clientPhone = "Numer telefonu jest wymagany";
    }

    if (!localData.startTime) {
      newErrors.startTime = "Data i godzina rozpoczęcia jest wymagana";
    }

    if (!localData.endTime) {
      newErrors.endTime = "Data i godzina zakończenia jest wymagana";
    }

    if (localData.startTime && localData.endTime) {
      const start = new Date(localData.startTime);
      const end = new Date(localData.endTime);
      
      if (start >= end) {
        newErrors.endTime = "Godzina zakończenia musi być późniejsza niż rozpoczęcia";
      }

      if (start < new Date()) {
        newErrors.startTime = "Nie można tworzyć rezerwacji w przeszłości";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        clientName: localData.clientName,
        clientEmail: localData.clientEmail,
        clientPhone: localData.clientPhone,
        serviceType: localData.serviceType as any,
        startTime: new Date(localData.startTime),
        endTime: new Date(localData.endTime),
        notes: localData.notes,
      });
    }
  };

  const handleStartTimeChange = (value: string) => {
    setLocalData(prev => ({ ...prev, startTime: value }));
    
    // Automatycznie ustaw czas zakończenia (1 godzina później)
    if (value && !localData.endTime) {
      const start = new Date(value);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 godzina
      setLocalData(prev => ({ ...prev, endTime: formatDateTimeLocal(end) }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Szczegóły Rezerwacji
        </h2>
        <p className="text-gray-600">
          Wprowadź dane klienta i termin rezerwacji
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dane Klienta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię i nazwisko *
              </label>
              <input
                type="text"
                value={localData.clientName}
                onChange={(e) => setLocalData(prev => ({ ...prev, clientName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Jan Kowalski"
              />
              {errors.clientName && (
                <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
              )}
            </div>

            {/* Client Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numer telefonu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={localData.clientPhone}
                  onChange={(e) => setLocalData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientPhone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+48 123 456 789"
                />
              </div>
              {errors.clientPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.clientPhone}</p>
              )}
            </div>

            {/* Client Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={localData.clientEmail}
                  onChange={(e) => setLocalData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientEmail ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="jan.kowalski@email.com"
                />
              </div>
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Service and Time Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Termin i Usługa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rodzaj usługi *
              </label>
              <select
                value={localData.serviceType}
                onChange={(e) => setLocalData(prev => ({ 
                  ...prev, 
                  serviceType: e.target.value as "physiotherapy" | "personal_training" | "other"
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="physiotherapy">Fizjoterapia</option>
                <option value="personal_training">Trening personalny</option>
                <option value="other">Inne</option>
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data i godzina rozpoczęcia *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={localData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startTime ? "border-red-300" : "border-gray-300"
                  }`}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data i godzina zakończenia *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={localData.endTime}
                  onChange={(e) => setLocalData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endTime ? "border-red-300" : "border-gray-300"
                  }`}
                  min={localData.startTime || new Date().toISOString().slice(0, 16)}
                />
              </div>
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Dodatkowe notatki
          </label>
          <textarea
            value={localData.notes}
            onChange={(e) => setLocalData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dodatkowe informacje o rezerwacji..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Przejdź do podsumowania
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
