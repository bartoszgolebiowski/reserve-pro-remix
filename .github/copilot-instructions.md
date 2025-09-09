# Zasady AI dla lernmemo

# Wizja aplikacji

Ten projekt ma na celu zbudowanie potężnej, a jednocześnie przyjaznej użytkownikowi aplikacji z fiszkami, która upraszcza tworzenie i naukę fiszek. Nasze główne cele to:

1. **Łatwość użycia**: Szybkie tworzenie fiszek z obrazów, plików CSV lub ręcznych wpisów.  
2. **Angażujące doświadczenie nauki**: Zapewnienie gry z fiszkami, która jest elastyczna i wygodna do regularnej praktyki.  
3. **Dostępność i rozwój**: Pozwolić użytkownikom się rejestrować, śledzić postępy i skalować się do planu premium z wyższymi limitami.

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

## Testowanie

### Wytyczne dla testów jednostkowych

#### Vitest

- Używaj Vitest do szybszego testowania w projektach opartych na Vite.
- Wykorzystuj obiekt vi do mocków i szpiegów.
- Stosuj wzorzec test.each dla testów parametryzowanych.
- Używaj plików setup do globalnej konfiguracji testów.
- Wykorzystuj funkcję inline snapshot dla małych snapshotów.
- Używaj trybu watch podczas rozwoju.
- Wykorzystuj tryb UI do interaktywnego eksplorowania testów.
- Implementuj mockowanie modułów i zależności.
- Używaj happy-dom jako środowiska DOM do testów.

## Baza danych

### Wytyczne dla SQL

#### SQLite

- **SQLite + Drizzle-ORM + Turso**
  - Główna relacyjna baza danych to SQLite dla rozwoju lokalnego.
  - Drizzle-ORM zapewnia typowane, lekkie warstwy ORM.
  - Modele bazy danych są definiowane w TypeScript i synchronizowane z bazą danych. Ich lokalizacja to `db/schema`.
  - Do komunikacji z bazą danych używamy repozytoriów w `lib/**/repos`.

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