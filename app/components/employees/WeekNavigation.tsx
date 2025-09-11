interface Props {
  weekDates: Date[];
  navigateWeek: (dir: "prev" | "next") => void;
  selectDay: (date: Date) => void;
  viewDay: Date;
}

export default function WeekNavigation({ weekDates, navigateWeek, selectDay, viewDay }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateWeek("prev")}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Poprzedni tydzień
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {weekDates.length > 0 &&
            `${weekDates[0].toLocaleDateString("pl-PL", { day: "numeric", month: "long" })} - 
               ${weekDates[6].toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}`}
        </h3>

        <button
          onClick={() => navigateWeek("next")}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Następny tydzień →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSelected = date.toDateString() === viewDay.toDateString();

          return (
            <div
              key={index}
              onClick={() => selectDay(date)}
              className={`border rounded-lg p-3 min-h-[200px] transition-all cursor-pointer hover:border-blue-400 ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : isWeekend
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-center mb-3">
                <div
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {date
                    .toLocaleDateString("pl-PL", { weekday: "short" })
                    .toUpperCase()}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isSelected ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
