/**
 * Strona logowania użytkownika
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { authContainer } from "~/lib/auth/container";

const redirectByRole = (role: string) => {
  switch (role) {
    case "OWNER":
      return "/dashboard/owner";
    case "WORKER":
      return "/dashboard/employee";
    default:
      return "/";
  }
};

/**
 * Loader - sprawdza czy użytkownik jest już zalogowany
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Sprawdzenie czy użytkownik jest już zalogowany
  const session = await authContainer.sessionService.getSession(request);

  // Jeśli zalogowany, przekieruj na stronę główną lub na stronę, z której przyszedł
  if (session?.user) {
    const redirectTo = redirectByRole(session.user.role);
    return redirect(redirectTo);
  }

  // W przeciwnym razie renderuj formularz logowania
  return {};
}

/**
 * Action - obsługa formularza logowania
 */
export async function action({ request }: ActionFunctionArgs) {
  // Pobranie danych z formularza
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Wywołanie logiki logowania
  const result = await authContainer.loginService.loginUser({
    email,
    password,
  });

  // Utworzenie odpowiedzi (przekierowanie lub błędy)
  if (result.success) {
    const redirectTo = redirectByRole(result.user!.role);
    throw redirect(redirectTo, result.responseInit);
  }

  return { success: false, errors: result.errors };
}

/**
 * Komponent React - formularz logowania
 */
export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zaloguj się do swojego konta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{" "}
            <a
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              zarejestruj się, jeśli nie masz konta
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
              <label htmlFor="password" className="sr-only">
                Hasło
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Hasło"
              />
              {actionData?.errors?.password ? (
                <p className="text-red-500 text-xs mt-1">
                  {actionData.errors.password}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
