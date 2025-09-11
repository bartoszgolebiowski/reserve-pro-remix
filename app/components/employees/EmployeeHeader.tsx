import { User } from "lucide-react";
import type { EmployeeWithLocations } from "~/lib/employee/types/employee.types";

interface Props {
  employee: EmployeeWithLocations;
  weeklyEarnings: number;
  weeklyHours: number;
  weeklyCount: number;
  goToToday: () => void;
  getEmployeeTypeDisplay: (type: string) => string;
}

export default function EmployeeHeader({ employee, weeklyEarnings, weeklyHours, weeklyCount, goToToday, getEmployeeTypeDisplay }: Props) {
  return (
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
            {weeklyHours.toFixed(1)}h • {weeklyCount} wizyt
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
  );
}
