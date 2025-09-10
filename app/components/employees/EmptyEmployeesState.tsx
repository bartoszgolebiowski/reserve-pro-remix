/**
 * Stan pustej listy pracowników
 */
import { Plus, User } from "lucide-react";
import React from "react";

interface EmptyEmployeesStateProps {
  onAddEmployee: () => void;
}

export const EmptyEmployeesState: React.FC<EmptyEmployeesStateProps> = ({ onAddEmployee }) => {
  return (
    <div className="text-center py-12">
      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Brak pracowników</h3>
      <p className="text-gray-600 mb-4">Dodaj pierwszego pracownika, aby rozpocząć</p>
      <button
        onClick={onAddEmployee}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Dodaj pracownika</span>
      </button>
    </div>
  );
};
