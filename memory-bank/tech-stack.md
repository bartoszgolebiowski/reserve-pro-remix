<tech-stack>
## Frontend

- **React + Remix-Run**
- Łączy podejście React oparte na komponentach UI z możliwościami renderowania i routingu po stronie serwera Remix-Run.
- **TypeScript**
- Dodaje statyczne typowanie dla lepszego doświadczenia programisty i mniejszej liczby błędów w czasie wykonywania.
- **Zod i Zod-Form-Data**
- Biblioteka walidacji oparta na schemacie, zapewniająca bezpieczne i spójne przetwarzanie danych w formularzach.
- **Tailwind CSS**
- Narzędzie CSS dla szybkiego rozwoju interfejsu użytkownika.
- **Autentykacja i autoryzacja**
- Cała logika uwierzytelniania i autoryzacji jest obsługiwana przez aplikację kliencką i serwerową bez zewnętrznych usług. Sesje są przechowywane w bazie danych SQLite. Role użytkowników są zarządzane w bazie danych i sprawdzane w kodzie backendu.
---

## Backend

- **Node.js**
- Środowisko wykonawcze JavaScript dla logiki po stronie serwera.
- **Remix-Run**
- Używane jako struktura serwera do obsługi routingu, renderowania po stronie serwera (w stosownych przypadkach) i żądań HTTP w Node.js.
- **TypeScript**
- Zapewnia bezpieczeństwo typu i łatwy w utrzymaniu kod również w backendzie.
- **SQLite + Drizzle-ORM + Turso**
- Podstawowa relacyjna baza danych to SQLite do lokalnego rozwoju.
- Drizzle-ORM zapewnia bezpieczną pod względem typu, lekką warstwę ORM.
- Turso oferuje zewnętrzną usługę bazy danych (opartą na protokole HTTP) do synchronizacji i/lub przechowywania danych produkcyjnych.

---

<tech-stack>