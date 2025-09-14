/**
 * Obsługa wylogowania użytkownika
 */
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";

export async function action({ request }: ActionFunctionArgs) {
  const session = await authContainer.sessionService.getSession(request);

  // Jeśli użytkownik jest zalogowany, wyloguj go
  if (session?.user) {
    // Wywołaj logikę wylogowania (unieważnienie sesji i przekierowanie)
    return authContainer.logoutService.logoutUser(request);
  }
  return redirect("/auth/login");
}

export async function loader() {
  return redirect("/auth/login");
}

export default function Logout() {
  return null; // Komponent nie renderuje nic, ponieważ przekierowanie następuje w loaderze
}
