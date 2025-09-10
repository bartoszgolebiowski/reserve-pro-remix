import { CheckCircle } from "lucide-react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useActionData, useLoaderData, useNavigate } from "react-router";
import { ReservationWizard } from "~/components/owner/reservations/wizard/ReservationWizard";
import type {
    Employee,
    Location,
    OwnerReservationFormData,
    ReservationWizardStep,
    Room
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
export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Implement authentication and get user data
  const ownerId = "owner-id"; // Placeholder
  
  // TODO: Fetch locations, rooms, employees for the owner
  const locations: Location[] = [];
  const rooms: Room[] = [];
  const employees: Employee[] = [];
  
  return {
    ownerId,
    locations,
    rooms,
    employees,
  };
}

/**
 * Action - obsługuje tworzenie nowej rezerwacji
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  try {
    // TODO: Implement reservation creation logic
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
      notes: formData.get("notes") as string || undefined,
    };

    // TODO: Create reservation using ReservationService
    // const reservation = await reservationService.createReservationByOwner(ownerId, reservationData);
    
    return redirect("/dashboard/owner/reservations");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia rezerwacji",
    };
  }
}

export default function NewReservation() {
  const { ownerId, locations, rooms, employees } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<ReservationWizardStep>("location");
  const [formData, setFormData] = useState<Partial<OwnerReservationFormData>>({});

  const handleStepChange = (step: ReservationWizardStep) => {
    setCurrentStep(step);
  };

  const handleDataChange = (data: Partial<OwnerReservationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = (finalData: OwnerReservationFormData) => {
    // Dane zostaną przesłane przez formularz
    setFormData(finalData);
  };

  return (
    <div className="">
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
          onStepChange={handleStepChange}
          onDataChange={handleDataChange}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

function getStepIndex(step: ReservationWizardStep): number {
  const steps = ["location", "room", "employee", "details", "summary"];
  return steps.indexOf(step);
}
