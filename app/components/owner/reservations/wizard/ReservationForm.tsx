import { Calendar, Clock, FileText, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import type { AvailabilitySlot, OwnerReservationFormData } from "~/lib/types";

interface ReservationFormProps {
  formData: Partial<OwnerReservationFormData>;
  onSubmit: (data: Partial<OwnerReservationFormData>) => void;
  // Optional list of already-occupied slots for the selected room/employee
  occupiedSlots?: AvailabilitySlot[];
}

export function ReservationForm({
  formData,
  onSubmit,
  occupiedSlots,
}: ReservationFormProps) {
  const [localData, setLocalData] = useState({
    clientName: formData.clientName || "",
    clientEmail: formData.clientEmail || "",
    clientPhone: formData.clientPhone || "",
    serviceType: formData.serviceType || "physiotherapy",
    startTime: formData.startTime
      ? formatDateTimeLocal(formData.startTime)
      : formatDateTimeLocal(roundUpToQuarter(new Date())),
    // duration in minutes (default to difference if both start/end provided, else 60)
    durationMinutes:
      formData.startTime && formData.endTime
        ? Math.max(
            15,
            Math.round(
              (new Date(formData.endTime).getTime() -
                new Date(formData.startTime).getTime()) /
                60000
            )
          )
        : 60,
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

    if (!localData.durationMinutes || localData.durationMinutes < 15) {
      newErrors.durationMinutes =
        "Długość rezerwacji musi wynosić co najmniej 15 minut";
    }

    if (localData.startTime && localData.durationMinutes) {
      const start = new Date(localData.startTime);
      const end = new Date(start.getTime() + localData.durationMinutes * 60000);

      if (start >= end) {
        newErrors.durationMinutes =
          "Długość musi powodować zakończenie późniejsze niż rozpoczęcie";
      }

      if (start < new Date()) {
        newErrors.startTime = "Nie można tworzyć rezerwacji w przeszłości";
      }

      if (occupiedSlots?.length) {
        const end = computeEndTimeISO(
          localData.startTime,
          localData.durationMinutes
        );
        const hasConflict = occupiedSlots.some((slot) => {
          const slotStart = new Date(slot.startTime);
          const slotEnd = new Date(slot.endTime);
          return start < slotEnd && end > slotStart;
        });

        if (hasConflict) {
          newErrors.startTime =
            "Wybrany termin koliduje z istniejącą rezerwacją";
        }
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
        startTime: parseDateTimeLocal(localData.startTime),
        endTime: new Date(
          parseDateTimeLocal(localData.startTime).getTime() +
            localData.durationMinutes * 60000
        ),
        notes: localData.notes,
      });
    }
  };

  function computeEndTimeISO(startISO: string, minutes: number) {
    const start = parseDateTimeLocal(startISO);
    return new Date(start.getTime() + minutes * 60000);
  }

  function roundUpToQuarter(date: Date) {
    const ms = 15 * 60 * 1000;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  }

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  function getDatePart(iso: string) {
    return iso ? iso.split("T")[0] : new Date().toISOString().slice(0, 10);
  }

  function getTimePart(iso: string) {
    const p = iso?.split("T")[1];
    return p ? p.slice(0, 5) : "09:00";
  }

  function generateQuarterTimes() {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        out.push(`${pad(h)}:${pad(m)}`);
      }
    }
    return out;
  }

  function parseDateTimeLocal(value: string): Date {
    if (!value) return new Date(NaN);
    const [datePart, timePart] = value.split("T");
    if (!datePart) return new Date(value);
    const [y, mo, d] = datePart.split("-").map(Number);
    const [hh = "0", mm = "0"] = (timePart || "").split(":");
    return new Date(y, (mo || 1) - 1, d || 1, Number(hh), Number(mm), 0, 0);
  }

  const [searchParams, setSearchParams] = useSearchParams();

  function handleDateChange(dateStr: string) {
    const time = getTimePart(localData.startTime);
    const candidate = new Date(`${dateStr}T${time}`);
    const min = roundUpToQuarter(new Date());
    const final = candidate < min ? min : candidate;
    setLocalData((prev) => ({
      ...prev,
      startTime: formatDateTimeLocal(final),
    }));

    // Zaktualizuj URL z nową datą, zachowując roomId
    const roomId = searchParams.get("roomId");
    if (roomId) {
      setSearchParams(
        { roomId, date: dateStr },
        { replace: true ,preventScrollReset: true}
      );
    }
  }

  function handleTimeChange(timeStr: string) {
    const date = getDatePart(localData.startTime);
    const candidate = new Date(`${date}T${timeStr}`);
    const min = roundUpToQuarter(new Date());
    const final = candidate < min ? min : candidate;
    setLocalData((prev) => ({
      ...prev,
      startTime: formatDateTimeLocal(final),
    }));
  }

  function isTimeOccupied(
    dateStr: string,
    timeStr: string,
    slots?: AvailabilitySlot[]
  ) {
    if (!slots || slots.length === 0) return false;
    const candidateStart = new Date(`${dateStr}T${timeStr}`);
    const candidateEnd = new Date(
      candidateStart.getTime() + localData.durationMinutes * 60000
    );
    for (const s of slots) {
      const slotStart = new Date(s.startTime);
      const slotEnd = new Date(s.endTime);
      // overlap if slotStart < candidateEnd && slotEnd > candidateStart
      if (slotStart < candidateEnd && slotEnd > candidateStart) return true;
    }
    return false;
  }

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Dane Klienta
            </h3>
            <div>
              <button
                type="button"
                onClick={() => {
                  // fill with anonymous sample data and clear related errors
                  setLocalData((prev) => ({
                    ...prev,
                    clientName: "Jan Nowak",
                    clientEmail: "jan.nowak@example.com",
                    clientPhone: "+48 123 456 789",
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
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
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię i nazwisko *
              </label>
              <input
                type="text"
                value={localData.clientName}
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
                }
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
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      clientPhone: e.target.value,
                    }))
                  }
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientPhone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+48 123 456 789"
                />
              </div>
              {errors.clientPhone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.clientPhone}
                </p>
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
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      clientEmail: e.target.value,
                    }))
                  }
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientEmail ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="jan.kowalski@email.com"
                />
              </div>
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.clientEmail}
                </p>
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
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    serviceType: e.target.value as
                      | "physiotherapy"
                      | "personal_training"
                      | "other",
                  }))
                }
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
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={getDatePart(localData.startTime)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startTime ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <select
                    value={getTimePart(localData.startTime)}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startTime ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    {generateQuarterTimes().map((t) => {
                      const isOccupied = isTimeOccupied(
                        getDatePart(localData.startTime),
                        t,
                        occupiedSlots
                      );
                      return (
                        <option key={t} value={t} disabled={isOccupied}>
                          {t} {isOccupied ? "(zajęty)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Długość *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={localData.durationMinutes}
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.durationMinutes
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  {/* Common durations from 15 min to 4 hours */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const minutes = (i + 1) * 15;
                    const label =
                      minutes >= 60 ? `${minutes / 60}h` : `${minutes} min`;
                    return (
                      <option key={minutes} value={minutes}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.durationMinutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.durationMinutes}
                </p>
              )}

              {/* Computed end time preview */}
              <p className="mt-2 text-sm text-gray-600">
                Koniec:{" "}
                {localData.startTime
                  ? formatDateTimeLocal(
                      computeEndTimeISO(
                        localData.startTime,
                        localData.durationMinutes
                      )
                    )
                  : "—"}
              </p>
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
            onChange={(e) =>
              setLocalData((prev) => ({ ...prev, notes: e.target.value }))
            }
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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
