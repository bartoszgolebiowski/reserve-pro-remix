/**
 * Route: Dashboard Owner Employees
 * Lista pracowników z możliwością dodawania/usuwania
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
    Outlet,
    redirect,
    useActionData,
    useLoaderData,
    useSearchParams,
} from "react-router";
import { EmployeesManager } from "~/components/employees/EmployeesManager";
import { authContainer } from "~/lib/auth/container";
import { employeeContainer } from "~/lib/employee/container";
import type {
    EmployeeWithLocations,
    Location,
} from "~/lib/employee/types/employee.types";
import { reservationContainer } from "~/lib/reservation/container";

type LoaderData = {
  employees: EmployeeWithLocations[];
  locations: Location[];
  editingEmployee?: EmployeeWithLocations;
};

type ActionData = {
  success?: boolean;
  errors?: Record<string, string>;
  employee?: EmployeeWithLocations;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Sprawdź autoryzację
  const session = await authContainer.rbacService.requireOwner(request);
  const ownerId = session.user.id;

  const url = new URL(request.url);
  const editEmployeeId = url.searchParams.get("edit");

  try {
    // Pobierz pracowników i lokalizacje
    const [employees, locations] = await Promise.all([
      employeeContainer.employeeService.getAllEmployeesWithLocations(ownerId),
      reservationContainer.locationsRepo.getLocationsByOwnerId(ownerId),
    ]);

    const mappedLocations = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      ownerId: loc.ownerId,
    }));

    // Jeśli edytujemy pracownika, pobierz jego szczegółowe dane
    let editingEmployee;
    if (editEmployeeId) {
      editingEmployee =
        await employeeContainer.employeeService.getEmployeeWithLocations(
          editEmployeeId,
          ownerId
        );
      if (!editingEmployee) {
        throw new Response("Pracownik nie został znaleziony", { status: 404 });
      }
    }

    return {
      employees,
      locations: mappedLocations,
      editingEmployee,
    };
  } catch (error) {
    console.error("Error loading employees:", error);
    throw new Response("Błąd podczas ładowania pracowników", { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // Sprawdź autoryzację
  const session = await authContainer.rbacService.requireOwner(request);
  const ownerId = session.user.id;

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "create-employee": {
        return await handleCreateEmployee(formData, ownerId);
      }
      case "update-employee": {
        return await handleUpdateEmployee(formData, ownerId);
      }
      case "delete-employee": {
        return await handleDeleteEmployee(formData, ownerId);
      }
      default: {
        return {
          success: false,
          errors: { _form: "Nieprawidłowa akcja" },
        };
      }
    }
  } catch (error) {
    console.error("Error in employee action:", error);
    return {
      success: false,
      errors: { _form: "Wystąpił błąd podczas przetwarzania żądania" },
    };
  }
}

async function handleCreateEmployee(formData: FormData, ownerId: string) {
  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    employeeType: formData.get("employeeType") as
      | "physiotherapist"
      | "personal_trainer",
    locations: formData.getAll("locations") as string[],
    hourlyRates: {} as Record<string, number>,
  };

  // Pobierz stawki godzinowe dla każdej lokalizacji
  for (const locationId of data.locations) {
    const rate = formData.get(`hourlyRate_${locationId}`);
    if (rate) {
      data.hourlyRates[locationId] = parseFloat(rate as string);
    }
  }

  // Walidacja
  const errors =
    employeeContainer.authValidators.validateEmployeeCreation(data);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Przygotuj dane do serwisu
  const createData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || undefined,
    password: data.password,
    employeeType: data.employeeType,
    locations: data.locations.map((locationId) => ({
      locationId,
      hourlyRate: data.hourlyRates[locationId],
    })),
  };

  // Utwórz pracownika
  const result = await employeeContainer.employeeService.createEmployee(
    createData,
    ownerId
  );

  if (result.success) {
    // Przekieruj po sukcesie, żeby zamknąć modal
    return redirect("/dashboard/owner/employees");
  } else {
    return {
      success: false,
      errors: result.errors,
    };
  }
}

async function handleUpdateEmployee(formData: FormData, ownerId: string) {
  const employeeId = formData.get("employeeId") as string;

  if (!employeeId) {
    return {
      success: false,
      errors: { _form: "ID pracownika jest wymagane" },
    };
  }

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    employeeType: formData.get("employeeType") as
      | "physiotherapist"
      | "personal_trainer",
    locations: formData.getAll("locations") as string[],
    hourlyRates: {} as Record<string, number>,
  };

  // Pobierz stawki godzinowe dla każdej lokalizacji
  for (const locationId of data.locations) {
    const rate = formData.get(`hourlyRate_${locationId}`);
    if (rate) {
      data.hourlyRates[locationId] = parseFloat(rate as string);
    }
  }

  // Walidacja
  const errors = employeeContainer.authValidators.validateEmployeeUpdate(data);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Przygotuj dane do serwisu
  const updateData = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone || undefined,
    employeeType: data.employeeType,
    locations: data.locations.map((locationId) => ({
      locationId,
      hourlyRate: data.hourlyRates[locationId],
    })),
  };

  // Zaktualizuj pracownika
  const result = await employeeContainer.employeeService.updateEmployee(
    employeeId,
    updateData,
    ownerId
  );

  if (result.success) {
    // Przekieruj po sukcesie
    return redirect("/dashboard/owner/employees");
  } else {
    return {
      success: false,
      errors: result.errors,
    };
  }
}

async function handleDeleteEmployee(formData: FormData, ownerId: string) {
  const employeeId = formData.get("employeeId") as string;

  if (!employeeId) {
    return {
      success: false,
      errors: { _form: "ID pracownika jest wymagane" },
    };
  }

  const result =
    await employeeContainer.employeeService.removeEmployeeFromOwnerLocations(
      employeeId,
      ownerId
    );

  if (result.success) {
    return redirect("/dashboard/owner/employees");
  } else {
    return {
      success: false,
      errors: result.errors,
    };
  }
}

export default function DashboardOwnerEmployees() {
  const { employees, locations, editingEmployee } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  const modalType = searchParams.get("modal");
  const isAddModalOpen = modalType === "add";
  const isEditModalOpen = !!editingEmployee;

  return (
    <>
      <hr className="my-8" />
      <EmployeesManager
        employees={employees}
        locations={locations}
        isModalOpen={isAddModalOpen}
        actionData={actionData}
        editingEmployee={editingEmployee}
        isEditModalOpen={isEditModalOpen}
      />
      <Outlet />
    </>
  );
}
