import { Form, useSearchParams } from "react-router";
import type { PricingConfigDTO } from "~/lib/pricing/types";
import type {
  AvailabilitySlot,
  Employee,
  Location,
  OwnerReservationFormData,
  ReservationWizardStep,
  Room,
} from "~/lib/types";
import { EmployeeSelector } from "./EmployeeSelector";
import { LocationSelector } from "./LocationSelector";
import { ReservationForm } from "./ReservationForm";
import { ReservationSummary } from "./ReservationSummary";
import { RoomSelector } from "./RoomSelector";

interface ReservationWizardProps {
  currentStep: ReservationWizardStep;
  formData: Partial<OwnerReservationFormData>;
  ownerId: string;
  locations: Location[];
  rooms: Room[];
  employees: Employee[];
  occupiedSlots?: AvailabilitySlot[];
  pricingConfig: PricingConfigDTO;
  onStepChange: (step: ReservationWizardStep) => void;
  onDataChange: (data: Partial<OwnerReservationFormData>) => void;
  onComplete: (data: OwnerReservationFormData) => void;
}

export function ReservationWizard({
  currentStep,
  formData,
  ownerId,
  locations,
  rooms,
  employees,
  occupiedSlots,
  pricingConfig,
  onStepChange,
  onDataChange,
  onComplete,
}: ReservationWizardProps) {
  const handleNext = () => {
    const steps: ReservationWizardStep[] = [
      "location",
      "room",
      "employee",
      "details",
      "summary",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      onStepChange(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: ReservationWizardStep[] = [
      "location",
      "room",
      "employee",
      "details",
      "summary",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      onStepChange(steps[currentIndex - 1]);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const handleLocationSelect = (locationId: string) => {
    onDataChange({ locationId });
    handleNext();
  };

  const handleRoomSelect = (roomId: string) => {
    const currentDate =
      searchParams.get("date") || new Date().toISOString().slice(0, 10);
    setSearchParams(
      { roomId, date: currentDate },
      { replace: true, preventScrollReset: true }
    );
    onDataChange({ roomId });
    handleNext();
  };

  const handleEmployeeSelect = (employeeId: string) => {
    onDataChange({ employeeId });
    handleNext();
  };

  const handleDetailsSubmit = (details: Partial<OwnerReservationFormData>) => {
    onDataChange(details);
    handleNext();
  };

  const handleFinalSubmit = () => {
    if (isFormComplete()) {
      onComplete(formData as OwnerReservationFormData);
    }
  };

  const isFormComplete = (): boolean => {
    return !!(
      formData.locationId &&
      formData.roomId &&
      formData.employeeId &&
      formData.clientName &&
      formData.clientEmail &&
      formData.clientPhone &&
      formData.serviceType &&
      formData.startTime &&
      formData.endTime
    );
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "location":
        return !!formData.locationId;
      case "room":
        return !!formData.roomId;
      case "employee":
        return !!formData.employeeId;
      case "details":
        return !!(
          formData.clientName &&
          formData.clientEmail &&
          formData.clientPhone &&
          formData.serviceType &&
          formData.startTime &&
          formData.endTime
        );
      case "summary":
        return isFormComplete();
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === "location" && (
          <LocationSelector
            locations={locations}
            selectedLocationId={formData.locationId}
            onLocationSelect={handleLocationSelect}
          />
        )}

        {currentStep === "room" && formData.locationId && (
          <RoomSelector
            locationId={formData.locationId}
            rooms={rooms.filter(
              (room) => room.locationId === formData.locationId
            )}
            selectedRoomId={formData.roomId}
            onRoomSelect={handleRoomSelect}
          />
        )}

        {currentStep === "employee" && formData.locationId && (
          <EmployeeSelector
            locationId={formData.locationId}
            employees={employees}
            selectedEmployeeId={formData.employeeId}
            onEmployeeSelect={handleEmployeeSelect}
          />
        )}

        {currentStep === "details" && (
          <ReservationForm
            formData={formData}
            onSubmit={handleDetailsSubmit}
            occupiedSlots={occupiedSlots}
            pricingConfig={pricingConfig}
          />
        )}

        {currentStep === "summary" && (
          <ReservationSummary
            formData={formData as OwnerReservationFormData}
            locations={locations}
            rooms={rooms}
            employees={employees}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === "location"}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            currentStep === "location"
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Wstecz
        </button>

        <div className="space-x-3">
          {currentStep !== "summary" ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                canProceed()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Dalej
            </button>
          ) : (
            <Form method="post" className="inline">
              {/* Hidden fields for form submission */}
              <input
                type="hidden"
                name="locationId"
                value={formData.locationId || ""}
              />
              <input
                type="hidden"
                name="roomId"
                value={formData.roomId || ""}
              />
              <input
                type="hidden"
                name="employeeId"
                value={formData.employeeId || ""}
              />
              <input
                type="hidden"
                name="clientName"
                value={formData.clientName || ""}
              />
              <input
                type="hidden"
                name="clientEmail"
                value={formData.clientEmail || ""}
              />
              <input
                type="hidden"
                name="clientPhone"
                value={formData.clientPhone || ""}
              />
              <input
                type="hidden"
                name="serviceType"
                value={formData.serviceType || ""}
              />
              <input
                type="hidden"
                name="startTime"
                value={formData.startTime?.toISOString() || ""}
              />
              <input
                type="hidden"
                name="endTime"
                value={formData.endTime?.toISOString() || ""}
              />
              <input type="hidden" name="notes" value={formData.notes || ""} />

              <button
                type="submit"
                disabled={!isFormComplete()}
                className={`px-6 py-2 text-sm font-medium rounded-md ${
                  isFormComplete()
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Utwórz Rezerwację
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
