import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { authContainer } from "~/lib/auth/container";
import { Layout } from "../components/Layout";

export function meta({}: MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

/**
 * Loader - sprawdza status logowania użytkownika
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  // Jeśli użytkownik jest na stronie głównej, przekieruj go do logowania, które to przekieruje go na odpowiednią stronę
  if (pathname === "/") {
    return redirect("/auth/login");
  }
  // Sprawdzenie czy użytkownik jest zalogowany
  const session = await authContainer.sessionService.getSession(request);

  return { session };
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();
  const { session } = loaderData;

  if (session?.user) {
    // Użytkownik jest zalogowany
    return (
      <Layout user={session.user}>
        <Outlet />
      </Layout>
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
