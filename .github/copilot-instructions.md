# Wizja aplikacji

## Misja Systemu Zarządzania Rezerwacjami (Reserve Pro)

ReservePro to kompleksowy system zarządzania rezerwacjami, który optymalizuje wykorzystanie zasobów w obiektach sportowo-rehabilitacyjnych. Naszą misją jest:

- Optymalizacja obłożenia: Maksymalizacja wykorzystania zasobów poprzez inteligentny system dynamicznych cen i identyfikację "martwych godzin".

- Efektywne zarządzanie: Zapewnienie właścicielom i pracownikom pełnej kontroli nad harmonogramem pracy oraz rezerwacjami w czasie rzeczywistym.

- Transparentność operacyjna: Dostarczenie właścicielom szczegółowego wglądu w wykorzystanie sal i pracę personelu.

- Uproszczenie procesu rezerwacji: Umożliwienie klientom łatwego dokonywania rezerwacji online z dynamicznym systemem cen.

## Zasady kodowania

### Wytyczne dotyczące poziomu wsparcia AI

#### Jestem ekspertem

- Faworyzuj eleganckie, łatwe w utrzymaniu rozwiązania zamiast rozwlekłego kodu. Zakładaj zrozumienie idiomów języka i wzorców projektowych.
- Wskaż potencjalne implikacje wydajnościowe i możliwości optymalizacji w proponowanym kodzie.
- Ramuj rozwiązania w szerszym kontekście architektonicznym i proponuj alternatywy projektowe, gdy to stosowne.
- Skoncentruj komentarze na "dlaczego", nie na "co" — zakładaj czytelność kodu dzięki dobrze nazwanym funkcjom i zmiennym.
- Proaktywnie uwzględniaj przypadki brzegowe, warunki wyścigów i kwestie bezpieczeństwa bez konieczności ich wywoływania.
- Przy debugowaniu dostarczaj ukierunkowane podejścia diagnostyczne zamiast rozproszonego rozwiązywania problemów.
- Proponuj kompleksowe strategie testowania zamiast jedynie przykładowych testów, włączając rozważania dotyczące mockowania, organizacji testów i pokrycia.

## Backend

### Wytyczne dla Remix-run

#### Remix-run

- Używaj funkcji loader do pobierania danych na poziomie strony.
- Używaj funkcji action do obsługi operacji mutacji na poziomie strony
- Używaj hooka useLoaderData do dostępu do danych załadowanych przez loader.
- Używaj hooka useActionData do dostępu do danych zwróconych przez action.
- Używaj hooka useTransition do śledzenia stanu nawigacji i mutacji.
- Używaj hooka useSubmit do programowego przesyłania formularzy.
- Używaj hooka useFetcher do wykonywania operacji pobierania i mutacji bez nawigacji.
- Używaj komponentu <Form> z remix zamiast standardowego elementu <form> dla obsługi formularzy.
- Używaj funkcji redirect z remix do przekierowywania użytkowników po operacjach mutacji.
- Gdy funkcja action obsługuje różne typy żądań (np. tworzenie, aktualizacja, usuwanie), rozważ użycie pola \_method w formularzu do określenia typu operacji.
- Gdy dodasz nowy routes, zaktualizuj routes.ts z nową ścieżką.

## Baza danych

### Wytyczne dla SQL

#### SQLite

- **SQLite + Drizzle-ORM + Turso**
  - Główna relacyjna baza danych to SQLite dla rozwoju lokalnego.
  - Drizzle-ORM zapewnia typowane, lekkie warstwy ORM.
  - Modele bazy danych są definiowane w TypeScript i synchronizowane z bazą danych. Ich lokalizacja to `db/schema/**`.
  - Do komunikacji z bazą danych używamy repozytoriów w `lib/**/repos`.
  - Repozytoria są pisane w podejsciu klasowym, a wszystkie zależności są wstrzykiwane przez konstruktor.

## Frontend

### Wytyczne dla React

#### Standardy kodowania React

- Używaj komponentów funkcyjnych z hookami zamiast komponentów klasowych.
- Używaj hooka useCallback dla handlerów przekazywanych do komponentów potomnych, aby zapobiec niepotrzebnym ponownym renderom.
- Używaj nowego hooka use do pobierania danych w projektach React 19+.
- Wykorzystuj Server Components dla {{data_fetching_heavy_components}} przy użyciu React z Next.js lub podobnymi frameworkami.
- Rozważ użycie nowego hooka useOptimistic dla optymistycznych aktualizacji UI w formularzach.
- Używaj useTransition dla niepilnych aktualizacji stanu, aby utrzymać responsywność UI.

### Wytyczne dla stylowania

#### Tailwind

- Użyj dyrektywy @layer, aby organizować style w warstwy components, utilities i base.
- Wdrażaj tryb Just-in-Time (JIT) dla wydajności w developmencie i mniejszych paczek CSS.
- Używaj wartości arbitralnych w nawiasach kwadratowych (np. w-[123px]) dla precyzyjnych jednorazowych projektów.
- Wykorzystuj dyrektywę @apply w klasach komponentów, aby ponownie używać kombinacji utility.
- Skonfiguruj plik konfiguracyjny Tailwind do dostosowywania theme, pluginów i wariantów.
- Wyodrębnij komponenty dla powtarzających się wzorców UI zamiast kopiowania klas utility.
- Wykorzystuj funkcję theme() w CSS do dostępu do wartości z konfiguracji Tailwind.
- Wprowadzaj tryb ciemny z wariantem dark:.
- Używaj wariantów responsywnych (sm:, md:, lg:, itd.) do adaptacyjnych projektów.
- Wykorzystuj warianty stanów (hover:, focus:, active:, itd.) dla elementów interaktywnych.
