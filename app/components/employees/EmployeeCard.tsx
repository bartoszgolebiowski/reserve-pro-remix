/**
 * Karta pojedynczego pracownika
 */
import { ArrowRight, Calendar, DollarSign, Edit2, Mail, MapPin, Trash2, User } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import type { EmployeeWithLocations } from "~/lib/employee/types/employee.types";

interface EmployeeCardProps {
  employee: EmployeeWithLocations;
  onDelete: (employeeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onDelete }) => {
  const getEmployeeTypeDisplay = (type: string) => {
    return type === 'physiotherapist' ? 'Fizjoterapeuta' : 'Trener personalny';
  };

  const handleDelete = () => {
    if (confirm(`Czy na pewno chcesz usunąć pracownika ${employee.firstName} ${employee.lastName}?`)) {
      onDelete(employee.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-teal-600">
                {getEmployeeTypeDisplay(employee.employeeType)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/dashboard/owner/employees?edit=${employee.id}`}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edytuj pracownika"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Usuń pracownika"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{employee.email}</span>
          </div>
          {/* TODO: Dodać phone do employee schema jesli potrzebne */}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Lokalizacje i stawki:</h4>
            {employee.locations.length > 0 ? (
              employee.locations.map(location => (
                <div key={location.locationId} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded mb-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{location.locationName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="font-medium">{location.hourlyRate} zł/h</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Brak przypisanych lokalizacji</p>
            )}
          </div>
        </div>

        <Link
          to={`/dashboard/owner/employees/${employee.id}/schedule`}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Zobacz harmonogram</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
