import { Dumbbell, Stethoscope, User, Users } from "lucide-react";
import type { Employee } from "~/lib/types";

interface EmployeeSelectorProps {
  locationId: string;
  employees: Employee[];
  selectedEmployeeId?: string;
  onEmployeeSelect: (employeeId: string) => void;
}

export function EmployeeSelector({
  locationId,
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
}: EmployeeSelectorProps) {
  // Filtruj pracowników przypisanych do tej lokalizacji
  // TODO: W rzeczywistej implementacji to powinno być zrobione na poziomie danych
  const locationEmployees = employees;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wybierz Pracownika
        </h2>
        <p className="text-gray-600">
          Wybierz pracownika, który będzie obsługiwać rezerwację
        </p>
      </div>

      {locationEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak pracowników w tej lokalizacji
          </h3>
          <p className="text-gray-600 mb-6">
            W wybranej lokalizacji nie ma jeszcze przypisanych pracowników. 
            Dodaj pracowników aby móc tworzyć rezerwacje.
          </p>
          <a
            href="/dashboard/owner/employees"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Zarządzaj Pracownikami
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locationEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              isSelected={selectedEmployeeId === employee.id}
              onClick={() => onEmployeeSelect(employee.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onClick: () => void;
}

function EmployeeCard({ employee, isSelected, onClick }: EmployeeCardProps) {
  const getEmployeeTypeDetails = (type: string) => {
    switch (type) {
      case "physiotherapist":
        return {
          name: "Fizjoterapeuta",
          icon: Stethoscope,
          color: "green",
        };
      case "personal_trainer":
        return {
          name: "Trener personalny",
          icon: Dumbbell,
          color: "orange",
        };
      default:
        return {
          name: "Pracownik",
          icon: User,
          color: "gray",
        };
    }
  };

  const typeDetails = getEmployeeTypeDetails(employee.employeeType);
  const IconComponent = typeDetails.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-6 text-left rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${
          isSelected ? "bg-blue-100" : "bg-gray-100"
        }`}>
          <IconComponent className={`w-6 h-6 ${
            isSelected ? "text-blue-600" : "text-gray-600"
          }`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            isSelected ? "text-blue-900" : "text-gray-900"
          }`}>
            {employee.firstName} {employee.lastName}
          </h3>
          
          <div className="mt-2 space-y-2">
            {/* Employee Type */}
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  typeDetails.color === "green"
                    ? "bg-green-100 text-green-800"
                    : typeDetails.color === "orange"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {typeDetails.name}
              </span>
            </div>

            {/* Email */}
            <p className={`text-sm ${
              isSelected ? "text-blue-700" : "text-gray-600"
            }`}>
              {employee.email}
            </p>

            {/* Specializations based on type */}
            <div className="mt-3">
              <span className={`text-xs ${
                isSelected ? "text-blue-600" : "text-gray-500"
              }`}>
                {employee.employeeType === "physiotherapist" && "Specjalizuje się w fizjoterapii"}
                {employee.employeeType === "personal_trainer" && "Specjalizuje się w treningu personalnym"}
              </span>
            </div>
          </div>
          
          {isSelected && (
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <span className="font-medium">Wybrany pracownik</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
