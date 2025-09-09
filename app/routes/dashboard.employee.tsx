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
export async function loader() {
  // Sprawdzenie czy użytkownik jest zalogowany
  return {};
}

export default function Home() {
  return <div> test</div>;
}
