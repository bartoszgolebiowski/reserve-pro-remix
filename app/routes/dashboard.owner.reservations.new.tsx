import { CheckCircle } from "lucide-react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  redirect,
  useActionData,
  useLoaderData,
  useSubmit
} from "react-router";
import { ReservationWizard } from "~/components/owner/reservations/wizard/ReservationWizard";
import { authContainer } from "~/lib/auth/container";
import { pricingOccupancyContainer } from "~/lib/pricing/container";
import { reservationContainer } from "~/lib/reservation/container";
import type {
  AvailabilitySlot, OwnerReservationFormData,
  ReservationWizardStep
} from "~/lib/types";

export function meta() {
  return [
    { title: "Nowa Rezerwacja - Reserve Pro" },
    { name: "description", content: "Utwórz nową rezerwację" },
  ];
}

/**
 * Loader - pobiera dane potrzebne do utworzenia rezerwacji
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Pobierz dane użytkownika z sesji
  const sessionData = await authContainer.sessionService.getSession(request);
  if (!sessionData?.user) {
    throw redirect("/auth/login");
  }

  // Sprawdź czy użytkownik to owner
  if (sessionData.user.role !== "OWNER") {
    throw new Error("Brak uprawnień do tworzenia rezerwacji");
  }

  const ownerId = sessionData.user.id;
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');
  const selectedDate = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);

  try {
    // Pobierz lokalizacje właściciela
    const locations =
      await reservationContainer.locationsRepo.getLocationsByOwnerId(ownerId);

    // Pobierz sale właściciela (z wszystkich lokalizacji)
    const rooms =
      await reservationContainer.roomsRepo.getRoomsByOwnerId(ownerId);

    // Pobierz pracowników właściciela (z wszystkich lokalizacji)
    const employees =
      await reservationContainer.employeesRepo.getEmployeesByOwnerId(ownerId);

    // Pobierz zajęte sloty dla wybranej sali (jeśli sala jest wybrana)
    let occupiedSlots: AvailabilitySlot[] = [];
    if (roomId && selectedDate) {
      occupiedSlots = await reservationContainer.availabilityService.getOccupiedSlotsForRoom(
        roomId,
        new Date(selectedDate)
      );
    }

    // Pobierz konfigurację cenową właściciela
    const pricingConfig = await pricingOccupancyContainer.pricingConfigService.getForOwner(ownerId);

    return {
      ownerId,
      locations,
      rooms,
      employees,
      occupiedSlots,
      pricingConfig,
    };
  } catch (error) {
    console.error("Error loading reservation data:", error);
    throw new Error("Błąd podczas ładowania danych");
  }
}

/**
 * Action - obsługuje tworzenie nowej rezerwacji
 */
export async function action({ request }: ActionFunctionArgs) {
  // Pobierz dane użytkownika z sesji
  const sessionData = await authContainer.sessionService.getSession(request);
  if (!sessionData?.user) {
    return redirect("/auth/login");
  }

  const ownerId = sessionData.user.id;

  // Sprawdź czy użytkownik to owner
  if (sessionData.user.role !== "OWNER") {
    return {
      error: "Brak uprawnień do tworzenia rezerwacji",
    };
  }

  const formData = await request.formData();

  try {
    // Przygotuj dane rezerwacji
    const reservationData: OwnerReservationFormData = {
      locationId: formData.get("locationId") as string,
      roomId: formData.get("roomId") as string,
      employeeId: formData.get("employeeId") as string,
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      clientPhone: formData.get("clientPhone") as string,
      serviceType: formData.get("serviceType") as any,
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
      notes: (formData.get("notes") as string) || undefined,
    };

    // Pobierz konfigurację cenową
    const pricingConfig =
      await reservationContainer.pricingService.getPricingOrDefault(ownerId);

    // Pobierz stawkę pracownika
    const employee = await reservationContainer.employeesRepo.getEmployeeById(
      reservationData.employeeId
    );
    if (!employee) {
      return {
        error: "Nie znaleziono wybranego pracownika",
      };
    }

    // Oblicz cenę rezerwacji
    const priceCalculation =
      reservationContainer.reservationService.calculateReservationPrice({
        serviceType: reservationData.serviceType,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        employeeRate: 0, // Będzie pobrana z employee locations
        deadHoursStart: pricingConfig.deadHoursStart,
        deadHoursEnd: pricingConfig.deadHoursEnd,
        deadHourDiscount: pricingConfig.deadHourDiscount,
        baseRates: {
          physiotherapy: pricingConfig.baseRatePhysiotherapy,
          personal_training: pricingConfig.baseRatePersonalTraining,
          other: pricingConfig.baseRateOther,
        },
        weekdayMultiplier: pricingConfig.weekdayMultiplier,
        weekendMultiplier: pricingConfig.weekendMultiplier,
      });

    // Utwórz rezerwację
    const reservation =
      await reservationContainer.reservationService.createReservationByOwner(
        ownerId,
        reservationData
      );

    // Zaktualizuj cenę w rezerwacji
    await reservationContainer.reservationsRepo.updateReservation(
      reservation.id,
      {
        basePrice: priceCalculation.basePrice,
        finalPrice: priceCalculation.finalPrice,
        isDeadHour: priceCalculation.isDeadHour,
      }
    );

    return redirect("/dashboard/owner/reservations");
  } catch (error) {
    console.error("Error creating reservation:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Wystąpił błąd podczas tworzenia rezerwacji",
    };
  }
}

export default function NewReservation() {
  const { ownerId, locations, rooms, employees, occupiedSlots, pricingConfig } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [currentStep, setCurrentStep] =
    useState<ReservationWizardStep>("location");
  const [formData, setFormData] = useState<Partial<OwnerReservationFormData>>(
    {}
  );

  const handleStepChange = (step: ReservationWizardStep) => {
    setCurrentStep(step);
  };

  const handleDataChange = (data: Partial<OwnerReservationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = (finalData: OwnerReservationFormData) => {
    // Dane zostaną przesłane przez formularz
    setFormData(finalData);
    // brakuje tutaj submita formularza
    const formData = Object.entries(finalData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc.append(key, value instanceof Date ? value.toISOString() : value);
      }
      return acc;
    }, new FormData());

    submit(formData, { method: "POST" });
  };

  const getStepIndex = (step: ReservationWizardStep): number => {
    const steps = ["location", "room", "employee", "details", "summary"];
    return steps.indexOf(step);
  };

  return (
    <div className="">
      <hr className="my-8" />
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: "location", label: "Lokalizacja", icon: "1" },
            { key: "room", label: "Sala", icon: "2" },
            { key: "employee", label: "Pracownik", icon: "3" },
            { key: "details", label: "Szczegóły", icon: "4" },
            { key: "summary", label: "Podsumowanie", icon: "5" },
          ].map((step, index) => {
            const isCompleted = getStepIndex(currentStep) > index;
            const isCurrent = currentStep === step.key;

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isCurrent
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.icon}</span>
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {index < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Błąd podczas tworzenia rezerwacji
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {actionData.error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Wizard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ReservationWizard
          currentStep={currentStep}
          formData={formData}
          ownerId={ownerId}
          locations={locations}
          rooms={rooms}
          employees={employees}
          occupiedSlots={occupiedSlots}
          pricingConfig={pricingConfig}
          onStepChange={handleStepChange}
          onDataChange={handleDataChange}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
