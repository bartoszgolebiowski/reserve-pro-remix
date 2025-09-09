/**
 * Obsługa wylogowania użytkownika
 */
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";

/**
 * Loader - przekierowuje użytkownika na stronę logowania jeśli wejdzie na tę stronę bezpośrednio
 */
export async function loader() {
  return redirect("/auth/login");
}

/**
 * Action - obsługa wylogowania
 */
export async function action({ request }: ActionFunctionArgs) {
  // Pobierz sesję
  const session = await authContainer.sessionService.getSession(request);

  // Jeśli użytkownik jest zalogowany, wyloguj go
  if (session?.user) {
    // Wywołaj logikę wylogowania (unieważnienie sesji i przekierowanie)
    return authContainer.logoutService.logoutUser(request);
  }

  // W przypadku braku sesji, przekieruj na stronę logowania
  return redirect("/auth/login");
}
