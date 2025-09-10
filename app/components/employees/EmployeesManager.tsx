/**
 * Główny komponent zarządzania pracownikami
 */
import { Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import type { EmployeeFormErrors, EmployeeWithLocations, Location } from "~/lib/employee/types/employee.types";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeModal } from "./EmployeeModal";
import { EmptyEmployeesState } from "./EmptyEmployeesState";

interface EmployeesManagerProps {
  employees: EmployeeWithLocations[];
  locations: Location[];
  isModalOpen: boolean;
  actionData?: {
    success?: boolean;
    errors?: EmployeeFormErrors;
    employee?: EmployeeWithLocations;
  } | null;
  editingEmployee?: EmployeeWithLocations;
  isEditModalOpen?: boolean;
}

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({
  employees,
  locations,
  isModalOpen,
  actionData,
  editingEmployee,
  isEditModalOpen = false,
}) => {
  const navigate = useNavigate();

  const handleAddEmployee = () => {
    navigate("/dashboard/owner/employees?modal=add");
  };

  const handleCloseModal = () => {
    navigate("/dashboard/owner/employees");
  };

  const handleCloseEditModal = () => {
    navigate("/dashboard/owner/employees");
  };

  const handleDeleteEmployee = (employeeId: string) => {
    // Użyj formularza do usunięcia pracownika
    const form = document.createElement('form');
    form.method = 'post';
    form.style.display = 'none';
    
    const intentInput = document.createElement('input');
    intentInput.name = 'intent';
    intentInput.value = 'delete-employee';
    form.appendChild(intentInput);
    
    const employeeIdInput = document.createElement('input');
    employeeIdInput.name = 'employeeId';
    employeeIdInput.value = employeeId;
    form.appendChild(employeeIdInput);
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Zarządzanie pracownikami</h2>
        <button
          onClick={handleAddEmployee}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj pracownika</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success === true && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">
            {actionData.employee 
              ? `Pracownik ${actionData.employee.firstName} ${actionData.employee.lastName} został pomyślnie dodany.`
              : 'Operacja została wykonana pomyślnie.'
            }
          </p>
        </div>
      )}

      {actionData?.success === false && actionData.errors?._form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{actionData.errors._form}</p>
        </div>
      )}

      {/* Employees Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>
      ) : (
        <EmptyEmployeesState onAddEmployee={handleAddEmployee} />
      )}

      {/* Modals */}
      <EmployeeModal
        isOpen={isModalOpen}
        mode="add"
        locations={locations}
        errors={actionData?.errors}
        onClose={handleCloseModal}
      />

      {editingEmployee && (
        <EmployeeModal
          isOpen={isEditModalOpen}
          mode="edit"
          employee={editingEmployee}
          locations={locations}
          errors={actionData?.errors}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};
