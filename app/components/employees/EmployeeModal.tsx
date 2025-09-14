/**
 * Modal dodawania/edycji pracownika
 */
import { X } from "lucide-react";
import React, { useState } from "react";
import { Form, useNavigate } from "react-router";
import type { EmployeeFormErrors, EmployeeWithLocations, Location } from "~/lib/employee/types/employee.types";

interface EmployeeModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  employee?: EmployeeWithLocations;
  locations: Location[];
  errors?: EmployeeFormErrors;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  mode,
  employee,
  locations,
  errors,
  onClose,
}) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: '', // TODO: Dodać phone do employee schema
    password: '',
    confirmPassword: '',
    employeeType: employee?.employeeType || 'physiotherapist' as 'physiotherapist' | 'personal_trainer',
    locations: employee?.locations.map(l => l.locationId) || [] as string[],
    hourlyRates: employee?.locations.reduce((acc, l) => ({ ...acc, [l.locationId]: l.hourlyRate }), {} as Record<string, number>) || {} as Record<string, number>
  });

  const handleLocationToggle = (locationId: string) => {
    const isSelected = formData.locations.includes(locationId);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        locations: prev.locations.filter(id => id !== locationId),
        hourlyRates: { ...prev.hourlyRates, [locationId]: 0 }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationId]
      }));
    }
  };

  const handleRateChange = (locationId: string, rate: string) => {
    setFormData(prev => ({
      ...prev,
      hourlyRates: { ...prev.hourlyRates, [locationId]: parseFloat(rate) || 0 }
    }));
  };

  const handleClose = () => {
    onClose();
    navigate("/dashboard/owner/employees");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'add' ? 'Dodaj nowego pracownika' : 'Edytuj pracownika'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value={mode === 'edit' ? 'update-employee' : 'create-employee'} />
          {mode === 'edit' && employee && (
            <input type="hidden" name="employeeId" value={employee.id} />
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imię
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors?.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwisko
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors?.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={mode === 'edit'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {mode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">Email nie może być zmieniony</p>
            )}
            {errors?.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon (opcjonalny)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+48 123 456 789"
            />
            {errors?.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {mode === 'add' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasło
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 znaków"
                />
                {errors?.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potwierdź hasło
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Powtórz hasło"
                />
                {errors?.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ pracownika
            </label>
            <select
              name="employeeType"
              value={formData.employeeType}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="physiotherapist">Fizjoterapeuta</option>
              <option value="personal_trainer">Trener personalny</option>
            </select>
            {errors?.employeeType && (
              <p className="text-red-500 text-xs mt-1">{errors.employeeType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lokalizacje i stawki godzinowe
            </label>
            <div className="space-y-3">
              {locations.map(location => (
                <div key={location.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="locations"
                        value={location.id}
                        checked={formData.locations.includes(location.id)}
                        onChange={() => handleLocationToggle(location.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{location.name}</span>
                    </label>
                  </div>
                  {formData.locations.includes(location.id) && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 mb-1">
                        Stawka godzinowa (zł)
                      </label>
                      <input
                        type="number"
                        name={`hourlyRate_${location.id}`}
                        min="0"
                        step="10"
                        value={formData.hourlyRates[location.id] || ''}
                        onChange={(e) => handleRateChange(location.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors?.locations && (
              <p className="text-red-500 text-xs mt-1">{errors.locations}</p>
            )}
            {errors?.hourlyRate && (
              <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>
            )}
          </div>

          {errors?._form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors._form}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'add' ? 'Dodaj' : 'Zapisz'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};
