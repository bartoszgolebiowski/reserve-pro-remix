import type { LoaderFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

/**
 * Loader - sprawdza status logowania użytkownika
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Sprawdzenie czy użytkownik jest zalogowany
  const session = await authContainer.sessionService.getSession(request);

  return { session };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { session } = loaderData;

  if (session?.user) {
    // Użytkownik jest zalogowany
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Jesteś zalogowany!
          </h2>
          <p className="text-gray-600">
            Witaj, {session.user.email}! Możesz korzystać z aplikacji.
          </p>
        </div>
      </div>
    );
  }

  // Użytkownik nie jest zalogowany
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Witaj w aplikacji
          </h2>
          <p className="mt-2 text-gray-600">
            Zaloguj się lub zarejestruj nowe konto, aby kontynuować.
          </p>
        </div>
        <div className="space-y-4">
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Zaloguj się
          </a>
          <a
            href="/auth/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Zarejestruj się
          </a>
        </div>
      </div>
    </div>
  );
}
