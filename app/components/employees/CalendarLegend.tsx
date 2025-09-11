export default function CalendarLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 items-center">
      <span className="text-sm font-medium text-gray-700">Legenda:</span>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
        <span className="text-xs text-gray-600">Fizjoterapia</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
        <span className="text-xs text-gray-600">Trening personalny</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
        <span className="text-xs text-gray-600">Inne</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-2 bg-blue-500 rounded"></div>
        <span className="text-xs text-gray-600">Pasek boczny wskazuje aktywną wizytę</span>
      </div>
    </div>
  );
}
