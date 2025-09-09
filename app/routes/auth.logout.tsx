/**
 * Obsługa wylogowania użytkownika
 */
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";

/**
 * Loader - przekierowuje użytkownika na stronę logowania jeśli wejdzie na tę stronę bezpośrednio
 */
export async function loader({ request }: ActionFunctionArgs) {
  const session = await authContainer.sessionService.getSession(request);

  // Jeśli użytkownik jest zalogowany, wyloguj go
  if (session?.user) {
    // Wywołaj logikę wylogowania (unieważnienie sesji i przekierowanie)
    return authContainer.logoutService.logoutUser(request);
  }
  return redirect("/auth/login");
}
