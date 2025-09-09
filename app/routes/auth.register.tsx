/**
 * Strona rejestracji użytkownika
 */
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { authContainer } from "~/lib/auth/container";

/**
 * Loader - sprawdza czy użytkownik jest już zalogowany
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Sprawdzenie czy użytkownik jest już zalogowany
  const session = await authContainer.sessionService.getSession(request);

  // Jeśli zalogowany, przekieruj na stronę główną
  if (session?.user) {
    return redirect("/");
  }

  // W przeciwnym razie renderuj formularz rejestracji
  return {};
}

/**
 * Action - obsługa formularza rejestracji
 */
export async function action({ request }: ActionFunctionArgs) {
  // Pobranie danych z formularza
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const passwordConfirm = formData.get("passwordConfirm")?.toString() || "";
  const role = formData.get("role")?.toString() || "";
  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";

  // Wywołanie logiki rejestracji
  const result = await authContainer.registrationService.registerUser({
    email,
    password,
    passwordConfirm,
    role,
    firstName,
    lastName,
  });

  // Jeśli rejestracja zakończyła się sukcesem, przekieruj na stronę sukcesu
  if (result.success) {
    throw redirect("/auth/register/success", result.responseInit);
  }

  // W przypadku błędu, zwróć błędy do formularza
  return result;
}

/**
 * Komponent React - formularz rejestracji
 */
export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Rejestracja nowego konta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{" "}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              zaloguj się, jeśli masz już konto
            </a>
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          {actionData?.errors?._form ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">
                  {actionData.errors._form}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adres e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adres e-mail"
              />
              {actionData?.errors?.email ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.email}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="firstName" className="sr-only">
                Imię
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Imię"
              />
              {actionData?.errors?.firstName ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.firstName}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Nazwisko
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nazwisko"
              />
              {actionData?.errors?.lastName ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.lastName}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Hasło
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Hasło"
              />
              {actionData?.errors?.password ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.password}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="sr-only">
                Potwierdzenie hasła
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Potwierdzenie hasła"
              />
              {actionData?.errors?.passwordConfirm ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.passwordConfirm}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Rola
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">Wybierz rolę...</option>
                <option value="OWNER">Właściciel</option>
                <option value="WORKER">Pracownik</option>
              </select>
              {actionData?.errors?.role ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.role}
                </p>
              ) : null}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              Hasło musi zawierać co najmniej 10 znaków, w tym małe i wielkie
              litery oraz cyfry lub znaki specjalne.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? "Rejestrowanie..." : "Zarejestruj się"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
