import { ArrowLeft, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type {
  AvailabilitySlot,
  Employee,
  Location,
  OwnerReservationFormData,
  ReservationWizardStep,
  Room
} from "~/lib/types";
import { ReservationWizard } from "./ReservationWizard";
import { WizardProgress } from "./WizardProgress";

interface NewReservationProps {
  ownerId: string;
  locations: Location[];
  rooms: Room[];
  employees: Employee[];
  occupiedSlots: AvailabilitySlot[];
  error?: string;
}

export function NewReservation({
  ownerId,
  locations,
  rooms,
  employees,
  occupiedSlots,
  error
}: NewReservationProps) {
  const [currentStep, setCurrentStep] = useState<ReservationWizardStep>("location");
  const [formData, setFormData] = useState<Partial<OwnerReservationFormData>>({});

  const handleStepChange = (step: ReservationWizardStep) => {
    setCurrentStep(step);
  };

  const handleDataChange = (data: Partial<OwnerReservationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = (finalData: OwnerReservationFormData) => {
    setFormData(finalData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to="/dashboard/owner/reservations"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nowa Rezerwacja</h1>
            <p className="text-gray-600 mt-1">Utwórz rezerwację dla klienta</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <WizardProgress currentStep={currentStep} />

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Błąd podczas tworzenia rezerwacji
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
          onStepChange={handleStepChange}
          onDataChange={handleDataChange}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
