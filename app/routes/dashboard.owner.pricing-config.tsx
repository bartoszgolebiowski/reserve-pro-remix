/**
 * Owner pricing configuration management route
 */
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { authContainer } from "~/lib/auth/container";
import { pricingOccupancyContainer } from "~/lib/pricing/container";
import type { PricingConfigDTO, PricingConfigFormData, ValidationError } from "~/lib/pricing/types";

type LoaderData = {
  config: PricingConfigDTO;
};

type ActionData = {
  success: boolean;
  errors?: ValidationError[];
  config?: PricingConfigDTO;
};

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const session = await authContainer.sessionService.getSession(request);
  
  if (!session || session.user.role !== "OWNER") {
    throw redirect("/auth/login");
  }

  const config = await pricingOccupancyContainer.pricingConfigService.getForOwner(session.user.id);

  return { config };
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
  const session = await authContainer.sessionService.getSession(request);
  
  if (!session || session.user.role !== "OWNER") {
    throw redirect("/auth/login");
  }

  const formData = await request.formData();
  
  const data: PricingConfigFormData = {
    deadHoursStart: Number(formData.get("deadHoursStart")),
    deadHoursEnd: Number(formData.get("deadHoursEnd")),
    deadHourDiscount: Number(formData.get("deadHourDiscount")),
    baseRatePhysiotherapy: Number(formData.get("baseRatePhysiotherapy")),
    baseRatePersonalTraining: Number(formData.get("baseRatePersonalTraining")),
    baseRateOther: Number(formData.get("baseRateOther")),
    weekdayMultiplier: Number(formData.get("weekdayMultiplier")),
    weekendMultiplier: Number(formData.get("weekendMultiplier")),
  };

  const result = await pricingOccupancyContainer.pricingConfigService.saveForOwner(session.user.id, data);

  return result;
}

export default function PricingConfigPage() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Local state for live preview
  const [liveConfig, setLiveConfig] = useState({
    deadHoursStart: config.deadHoursStart,
    deadHoursEnd: config.deadHoursEnd,
    deadHourDiscount: config.deadHourDiscount,
  });

  // Helper function to get error for field
  const getFieldError = (field: string) => 
    actionData?.errors?.find((e: ValidationError) => e.field === field)?.message;

  // Update live config when inputs change
  const handleInputChange = (field: keyof typeof liveConfig, value: number) => {
    setLiveConfig(prev => ({ ...prev, [field]: value }));
  };

  // Component for visual dead hours representation
  const DeadHoursVisualizer = ({ deadHoursStart, deadHoursEnd, discount }: { deadHoursStart: number; deadHoursEnd: number; discount: number }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
    
    const isDeadHour = (hour: number) => {
      if (deadHoursStart <= deadHoursEnd) {
        return hour >= deadHoursStart && hour < deadHoursEnd;
      } else {
        // Dead hours cross midnight (e.g., 22:00 to 06:00)
        return hour >= deadHoursStart || hour < deadHoursEnd;
      }
    };

    const handleHourClick = (hour: number) => {
      if (selectionMode === 'start') {
        handleInputChange('deadHoursStart', hour);
        // Update form input
        const input = document.getElementById('deadHoursStart') as HTMLInputElement;
        if (input) input.value = hour.toString();
        setSelectionMode(null);
      } else if (selectionMode === 'end') {
        handleInputChange('deadHoursEnd', hour);
        // Update form input
        const input = document.getElementById('deadHoursEnd') as HTMLInputElement;
        if (input) input.value = hour.toString();
        setSelectionMode(null);
      }
    };

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Wizualizacja martwych godzin (24h)</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectionMode(selectionMode === 'start' ? null : 'start')}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectionMode === 'start' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {selectionMode === 'start' ? 'Anuluj' : 'Ustaw początek'}
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode(selectionMode === 'end' ? null : 'end')}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectionMode === 'end' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {selectionMode === 'end' ? 'Anuluj' : 'Ustaw koniec'}
            </button>
          </div>
        </div>
        
        {selectionMode && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            {selectionMode === 'start' 
              ? 'Kliknij na godzinę, aby ustawić początek martwych godzin' 
              : 'Kliknij na godzinę, aby ustawić koniec martwych godzin'}
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          {/* Time labels row */}
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
          
          {/* Visual timeline */}
          <div className="flex h-8 rounded overflow-hidden border border-gray-200">
            {hours.map((hour) => {
              const isDead = isDeadHour(hour);
              const isSelectionTarget = selectionMode !== null;
              
              return (
                <div
                  key={hour}
                  onClick={() => isSelectionTarget && handleHourClick(hour)}
                  className={`flex-1 relative group transition-all duration-200 ${
                    isSelectionTarget ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isDead 
                      ? 'bg-orange-400 hover:bg-orange-500' 
                      : 'bg-blue-200 hover:bg-blue-300'
                  } ${
                    isSelectionTarget ? 'hover:ring-2 hover:ring-blue-400' : ''
                  }`}
                  title={`${hour.toString().padStart(2, '0')}:00 - ${isDead ? 'Martwa godzina' : 'Normalna godzina'}${isSelectionTarget ? ' (kliknij aby ustawić)' : ''}`}
                >
                  {/* Hour marker every 6 hours */}
                  {hour % 6 === 0 && (
                    <div className="absolute top-0 left-0 w-px h-full bg-gray-400 z-10"></div>
                  )}
                  
                  {/* Current start/end markers */}
                  {hour === deadHoursStart && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full border border-white z-20" title="Początek martwych godzin"></div>
                  )}
                  {hour === deadHoursEnd && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full border border-white z-20" title="Koniec martwych godzin"></div>
                  )}
                  
                  {/* Tooltip-like hour display on hover */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 text-white px-1 py-0.5 rounded whitespace-nowrap z-30">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 mt-2 flex-wrap">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>Martwe godziny ({Math.round(discount * 100)}% zniżki)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>Normalne godziny</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Początek</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Koniec</span>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="text-xs text-gray-500 text-center mt-2">
            {deadHoursStart <= deadHoursEnd ? (
              <span>Martwe godziny: {deadHoursStart.toString().padStart(2, '0')}:00 - {deadHoursEnd.toString().padStart(2, '0')}:00</span>
            ) : (
              <span>Martwe godziny: {deadHoursStart.toString().padStart(2, '0')}:00 - {deadHoursEnd.toString().padStart(2, '0')}:00 (przez północ)</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Konfiguracja Cenowa</h1>
        
        {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Konfiguracja została zapisana pomyślnie.
          </div>
        )}

        <Form method="post" className="space-y-8">
          {/* Dead Hours Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Martwe Godziny</h2>
            
            {/* Visual representation */}
            <DeadHoursVisualizer 
              deadHoursStart={liveConfig.deadHoursStart} 
              deadHoursEnd={liveConfig.deadHoursEnd}
              discount={liveConfig.deadHourDiscount}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label htmlFor="deadHoursStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Początek (godzina)
                </label>
                <input
                  type="number"
                  id="deadHoursStart"
                  name="deadHoursStart"
                  min="0"
                  max="23"
                  defaultValue={config.deadHoursStart}
                  onChange={(e) => handleInputChange('deadHoursStart', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('deadHoursStart') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('deadHoursStart')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="deadHoursEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  Koniec (godzina)
                </label>
                <input
                  type="number"
                  id="deadHoursEnd"
                  name="deadHoursEnd"
                  min="0"
                  max="23"
                  defaultValue={config.deadHoursEnd}
                  onChange={(e) => handleInputChange('deadHoursEnd', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('deadHoursEnd') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('deadHoursEnd')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="deadHourDiscount" className="block text-sm font-medium text-gray-700 mb-1">
                  Zniżka (0-1)
                </label>
                <input
                  type="number"
                  id="deadHourDiscount"
                  name="deadHourDiscount"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue={config.deadHourDiscount}
                  onChange={(e) => handleInputChange('deadHourDiscount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {Math.round(liveConfig.deadHourDiscount * 100)}% zniżki
                </p>
                {getFieldError('deadHourDiscount') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('deadHourDiscount')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Base Rates Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Stawki Bazowe (zł/h)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="baseRatePhysiotherapy" className="block text-sm font-medium text-gray-700 mb-1">
                  Fizjoterapia
                </label>
                <input
                  type="number"
                  id="baseRatePhysiotherapy"
                  name="baseRatePhysiotherapy"
                  min="0"
                  step="0.01"
                  defaultValue={config.baseRatePhysiotherapy}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('baseRatePhysiotherapy') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('baseRatePhysiotherapy')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="baseRatePersonalTraining" className="block text-sm font-medium text-gray-700 mb-1">
                  Trening personalny
                </label>
                <input
                  type="number"
                  id="baseRatePersonalTraining"
                  name="baseRatePersonalTraining"
                  min="0"
                  step="0.01"
                  defaultValue={config.baseRatePersonalTraining}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('baseRatePersonalTraining') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('baseRatePersonalTraining')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="baseRateOther" className="block text-sm font-medium text-gray-700 mb-1">
                  Inne
                </label>
                <input
                  type="number"
                  id="baseRateOther"
                  name="baseRateOther"
                  min="0"
                  step="0.01"
                  defaultValue={config.baseRateOther}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('baseRateOther') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('baseRateOther')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Multipliers Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mnożniki Czasowe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weekdayMultiplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Dni robocze
                </label>
                <input
                  type="number"
                  id="weekdayMultiplier"
                  name="weekdayMultiplier"
                  min="0.1"
                  step="0.1"
                  defaultValue={config.weekdayMultiplier}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('weekdayMultiplier') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('weekdayMultiplier')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="weekendMultiplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Weekendy
                </label>
                <input
                  type="number"
                  id="weekendMultiplier"
                  name="weekendMultiplier"
                  min="0.1"
                  step="0.1"
                  defaultValue={config.weekendMultiplier}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {getFieldError('weekendMultiplier') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('weekendMultiplier')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Zapisz Konfigurację
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
