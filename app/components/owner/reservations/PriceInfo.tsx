/**
 * Component for displaying price information in reservation forms
 */
import { DollarSign, Info } from "lucide-react";
import type { PriceBreakdown } from "~/lib/pricing/types";

interface PriceInfoProps {
  breakdown: PriceBreakdown | null;
}

export function PriceInfo({ breakdown }: PriceInfoProps) {
  if (!breakdown) {
    return null;
  }
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Informacje o cenie
            </span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {breakdown.finalPrice.toFixed(2)} zł
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Stawka bazowa:</span>
            <span>{breakdown.baseRate.toFixed(2)} zł/h</span>
          </div>

          {breakdown.employeeRate && (
            <div className="flex justify-between text-gray-700">
              <span>Stawka pracownika:</span>
              <span>{breakdown.employeeRate.toFixed(2)} zł/h</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <span>Mnożnik czasowy:</span>
            <span>×{breakdown.timeMultiplier}</span>
          </div>

          {breakdown.isDeadHour && breakdown.deadHourDiscount && (
            <>
              <div className="flex justify-between text-orange-600 font-medium">
                <span>🕐 Martwa godzina:</span>
                <span>-{(breakdown.deadHourDiscount * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Rabat:</span>
                <span>-{breakdown.discountAmount.toFixed(2)} zł</span>
              </div>
            </>
          )}
        </div>

        {/* Dead hour indicator */}
        {breakdown.isDeadHour && (
          <div className="bg-orange-100 border border-orange-200 rounded p-2">
            <div className="flex items-center space-x-2 text-orange-700">
              <Info className="w-4 h-4" />
              <span className="text-xs font-medium">
                Ten termin znajduje się w "martwych godzinach" - zostanie
                zastosowany rabat
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
