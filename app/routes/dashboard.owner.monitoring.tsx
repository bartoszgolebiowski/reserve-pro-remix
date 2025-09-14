/**
 * Owner mexport async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const session = await authContainer.sessionService.getSession(request);
  
  if (!session || session.user.role !== "owner") {
    throw redirect("/auth/login");
  }ing dashboard route
 */
import type { LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { authContainer } from "~/lib/auth/container";
import { pricingOccupancyContainer } from "~/lib/pricing/container";
import type { OccupancyFilter, OccupancyResult } from "~/lib/pricing/types";

type LoaderData = {
  occupancyData: OccupancyResult;
  filterOptions: Awaited<
    ReturnType<
      typeof pricingOccupancyContainer.occupancyService.getFilterOptions
    >
  >;
};

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const session = await authContainer.sessionService.getSession(request);

  if (!session || session.user.role !== "OWNER") {
    throw redirect("/auth/login");
  }

  const url = new URL(request.url);

  // Parse filters from URL
  const filter: OccupancyFilter = {
    dateFrom:
      url.searchParams.get("dateFrom") ||
      pricingOccupancyContainer.occupancyService.getDefaultFilter().dateFrom,
    dateTo:
      url.searchParams.get("dateTo") ||
      pricingOccupancyContainer.occupancyService.getDefaultFilter().dateTo,
    locationId: url.searchParams.get("locationId") || undefined,
    serviceType: (url.searchParams.get("serviceType") as any) || undefined,
    employeeId: url.searchParams.get("employeeId") || undefined,
    roomId: url.searchParams.get("roomId") || undefined,
  };

  const [occupancyData, filterOptions] = await Promise.all([
    pricingOccupancyContainer.occupancyService.getOccupancyData(
      session.user.id,
      filter
    ),
    pricingOccupancyContainer.occupancyService.getFilterOptions(
      session.user.id
    ),
  ]);

  return {
    occupancyData,
    filterOptions,
  };
}

export default function MonitoringPage() {
  const { occupancyData, filterOptions } = useLoaderData<typeof loader>();

  // Helper to format date for input
  const formatDateForInput = (isoString: string) => {
    return new Date(isoString).toISOString().split("T")[0];
  };

  // Helper to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  // Helper to format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Monitoring Obłożenia</h1>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Filtry</h2>

          <Form method="get" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Date range */}
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Od
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  defaultValue={formatDateForInput(
                    occupancyData.filters.dateFrom
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Do
                </label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  defaultValue={formatDateForInput(
                    occupancyData.filters.dateTo
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location filter */}
              <div>
                <label
                  htmlFor="locationId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lokalizacja
                </label>
                <select
                  id="locationId"
                  name="locationId"
                  defaultValue={occupancyData.filters.locationId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wszystkie</option>
                  {filterOptions.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service type filter */}
              <div>
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Typ usługi
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  defaultValue={occupancyData.filters.serviceType || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wszystkie</option>
                  {filterOptions.serviceTypes.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee filter */}
              <div>
                <label
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pracownik
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  defaultValue={occupancyData.filters.employeeId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wszystkich</option>
                  {filterOptions.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Filtruj
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Łączna liczba slotów
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {occupancyData.stats.totalSlots}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Potwierdzone
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {occupancyData.stats.confirmedSlots}
            </p>
            <p className="text-sm text-gray-500">
              {formatPercentage(occupancyData.stats.occupancyRate)} obłożenia
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Przychód i koszty
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {formatPrice(occupancyData.stats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-500">
              {formatPrice(occupancyData.stats.totalEmployeeCost)} koszt
              trenerów
            </p>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-lg font-bold text-emerald-600">
                {formatPrice(occupancyData.stats.totalProfit)}
              </p>
              <span className="text-sm text-gray-500">zysk</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Martwe godziny
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {occupancyData.stats.deadHourSlots}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {formatPrice(occupancyData.stats.deadHourRevenue)} przychodu
              </p>
              <p className="text-sm text-gray-500">
                {formatPrice(occupancyData.stats.deadHourProfit)} zysku
              </p>
            </div>
          </div>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Rezerwacje</h2>
          </div>

          {occupancyData.slots.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Brak rezerwacji dla wybranych filtrów.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Czas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pracownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ usługi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Przychód
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Koszt trenera
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zysk
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {occupancyData.slots.map((slot) => {
                    // Calculate duration in hours
                    const durationInHours =
                      (new Date(slot.endTime).getTime() -
                        new Date(slot.startTime).getTime()) /
                      (1000 * 60 * 60);
                    const employeeCost = slot.hourlyRate * durationInHours;
                    const profit = slot.finalPrice - employeeCost;

                    return (
                      <tr
                        key={slot.id}
                        className={slot.isDeadHour ? "bg-orange-50" : ""}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {new Date(slot.startTime).toLocaleDateString(
                              "pl-PL"
                            )}
                          </div>
                          <div className="text-gray-500">
                            {new Date(slot.startTime).toLocaleTimeString(
                              "pl-PL",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(slot.endTime).toLocaleTimeString(
                              "pl-PL",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slot.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{slot.employeeName}</div>
                          <div className="text-gray-500 text-xs">
                            {slot.employeeType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{slot.roomName}</div>
                          <div className="text-gray-500 text-xs">
                            {slot.locationName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slot.serviceType === "physiotherapy" &&
                            "Fizjoterapia"}
                          {slot.serviceType === "personal_training" &&
                            "Trening personalny"}
                          {slot.serviceType === "other" && "Inne"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              slot.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : slot.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {slot.status === "confirmed" && "Potwierdzona"}
                            {slot.status === "cancelled" && "Anulowana"}
                            {slot.status === "completed" && "Zakończona"}
                          </span>
                          {slot.isDeadHour && (
                            <div className="text-xs text-orange-600 mt-1">
                              Martwa godzina
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatPrice(slot.finalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(employeeCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={
                              profit >= 0 ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            {formatPrice(profit)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
