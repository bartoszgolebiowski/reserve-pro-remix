# Dokument Wymagań Produktu (PRD) - System Zarządzania Rezerwacjami (Wersja Zaktualizowana)

## 1. Wprowadzenie

Niniejszy dokument opisuje wymagania funkcjonalne dla aplikacji służącej do zarządzania rezerwacjami zajęć (fizjoterapia, treningi personalne) oraz monitorowania obłożenia zasobów (pracownicy, sale) w obiekcie sportowym/rehabilitacyjnym. Głównym celem jest optymalizacja wykorzystania zasobów poprzez oferowanie dynamicznych cen oraz zapewnienie właścicielowi wglądu w bieżące obłożenie.

## 2. Cele Biznesowe

- Zwiększenie utylizacji zasobów (sale, pracownicy) poprzez wypełnienie mniej popularnych godzin ("puste godziny").
- Umożliwienie oferowania atrakcyjniejszych cen dla klientów w godzinach o niższym obłożeniu.
- Zapewnienie właścicielowi możliwości śledzenia (traceability) wykorzystania sal oraz pracy poszczególnych pracowników (trenerów, fizjoterapeutów).
- Zapewnienie wglądu w **czasie rzeczywistym**w obłożenie obiektu dla różnych typów usług (fizjoterapia, treningi personalne; inne typy usług mogą być definiowane przez właściciela, ale ich rezerwacja i szczegółowe zarządzanie wykracza poza zakres MVP).

\* *Uwaga: "Czas rzeczywisty" oznacza odświeżanie danych z minimalnym możliwym opóźnieniem, akceptowalnym dla operacyjnej pracy systemu (np. co kilka sekund/minut lub przy każdej zmianie).*

## 3. Wymagania Funkcjonalne Systemu

### 3.1. Zarządzanie Użytkownikami i Rolami

- **Tworzenie Kont:** System umożliwia tworzenie kont dla Właścicieli i Pracowników. Podczas rejestracji użytkownik wybiera odpowiednią rolę.
- **Role Użytkowników:**
    - **Właściciel:** Pełne uprawnienia administracyjne (opisane w sekcji 3.4).
    - **Pracownik:** Dostęp do własnego kalendarza, możliwość zarządzania rezerwacjami, dodawania blokad czasowych.
- **Zarządzanie Pracownikami przez Właściciela:** Właściciel ma możliwość dodawania nowych pracowników do systemu i przypisywania im ról (Fizjoterapeuta, Trener Personalny), oraz ustalanie stawki godzinowej dla pracownika w danej lokalizacji.
- **Dołączanie do Lokalizacji przez Pracownika:** Pracownik ma możliwość dołączenia (lub wysłania prośby o dołączenie) do jednej lub wielu lokalizacji zdefiniowanych w systemie.
- **Klienci:** W ramach MVP system **nie** wymaga tworzenia kont dla klientów końcowych. Dane klienta (imię, nazwisko, telefon, e-mail) są zbierane podczas procesu rezerwacji. Funkcjonalność kont klienckich i historii ich rezerwacji jest rozważana jako przyszłe rozszerzenie (Non-MVP).

### 3.2. Zarządzanie Kalendarzami

- **Kalendarz Pracownika:**
    - Każdy pracownik (trener, fizjoterapeuta) ma dostęp do swojego indywidualnego kalendarza.
    - Pracownik może dodawać/zarządzać blokadami czasowymi w swoim kalendarzu:
        - Zajęcia związane z pracą w obiekcie (rezerwacje).
        - Dni wolne, urlopy, inne niedostępności (blokady).
- **Kalendarz Pomieszczenia (Sali):**
    - Każda sala ma swój indywidualny kalendarz.
    - Kalendarz sali odzwierciedla jej zajętość wynikającą z zaplanowanych rezerwacji oraz ewentualnych blokad (np. remont).
    - System musi **zapobiegać** konfliktom rezerwacji (podwójnym rezerwacjom) dla tej samej sali w tym samym czasie.

### 3.3. Zarządzanie Rezerwacjami

- **Definicja Zajęć:**
    - Każda rezerwacja w systemie musi składać się z powiązania: Pracownik + Sala + Przedział Czasowy + Dane Klienta (Imię, Nazwisko, Telefon, E-mail).
- **Proces Rezerwacji przez Pracownika:**
    - Pracownik, korzystając z widoku kalendarza (swojego i/lub wspólnego), identyfikuje wolny termin dla siebie i odpowiedniej sali.
    - Podczas tworzenia rezerwacji pracownik wprowadza dane klienta (opcjonalne).
    - System **musi weryfikować** dostępność pracownika i sali w wybranym terminie przed utworzeniem rezerwacji.
    - Rezerwacja łączy pracownika z salą na określony przedział czasowy.
    - **Walidacja Typu Usługi:** System musi pilnować zgodności typu usługi sali i kwalifikacji pracownika:
        - Prawidłowa rezerwacja (przykłady):
            - sala (Typ A: Fizjo) + pracownik (Typ A: Fizjo)
            - sala (Typ B: Trening) + pracownik (Typ B: Trener)
            - sala (Typ A+B) + pracownik (Typ A: Fizjo)
            - sala (Typ A+B) + pracownik (Typ B: Trener)
        - Nieprawidłowa rezerwacja (system musi blokować lub ostrzegać):
            - sala (Typ A: Fizjo) + pracownik (Typ B: Trener)
            - sala (Typ B: Trening) + pracownik (Typ A: Fizjo)
- **Proces Rezerwacji przez Użytkownika (Klienta):**
    - System musi udostępniać interfejs dla użytkownika końcowego (klienta).
    - Użytkownik wybiera lokalizację (np. Miasto), lub konkretną lokalizację (np. Obiekt Sportowy).
    - Użytkownik wybiera typ zajęć (Fizjoterapia, Trening personalny).
    - Użytkownik wybiera datę i preferowaną godzinę (automatycznie domyślnie bieżący dzień, żeby szybko pokazać oferty).
    - System wyświetla dostępne terminy (kombinacje Pracownik + Sala + Czas) dla wybranych kryteriów.
    - **Identyfikacja i Promocja "Martwych Godzin":**
        - **Definicja "Martwych Godzin" (MVP):** Godziny **przed 16:00** w dni robocze (lub inne, konfigurowalne przez właściciela stałe przedziały) są uznawane za "martwe godziny". W przyszłości mechanizm może być dynamiczny, oparty na analizie historycznego i bieżącego obłożenia.
        - System musi wizualnie **wyróżniać** terminy przypadające w "martwych godzinach".
        - System musi **automatycznie stosować obniżoną cenę** dla rezerwacji w "martwych godzinach".
    - **Potwierdzenie Rezerwacji:** Aby rezerwacja została utworzona, użytkownik musi podać swoje dane (Imię, Nazwisko, Telefon, E-mail) oraz **dokonać płatności** online (wymagana integracja z systemem płatności).
    - **Zapobieganie Konfliktom:** System musi przeprowadzać ostateczne sprawdzenie dostępności tuż przed dokonaniem płatności, aby zapobiec konfliktom. W przypadku niedostępności, system powinien zaproponować alternatywne terminy/pracowników/sale.
- **Algorytm Dynamicznego Ustalania Ceny:**
    - Cena bazowa usługi jest ustalana na podstawie:
        - Lokalizacji.
        - Typu usługi.
        - Stawki przypisanej do pracownika w danej lokalizacji (ustalanej przez właściciela).
    - System musi umożliwiać dynamiczne modyfikowanie ceny końcowej na podstawie:
        - Terminu (np. dzień tygodnia, godzina).
        - Identyfikacji "martwych godzin" (zastosowanie zniżki).
        - Potencjalnie innych czynników konfigurowanych przez właściciela (np. ogólne obłożenie - jako przyszłe rozszerzenie).
    - Cena końcowa, uwzględniająca ewentualne zniżki za "martwe godziny", musi być jasno komunikowana użytkownikowi przed dokonaniem płatności.

### 3.4. Widok Właściciela (Interfejs Administracyjny)

- **Zarządzanie Zasobami:**
    - Właściciel może dodawać/edytować/usuwać **lokalizacje**.
    - Właściciel może tworzyć/edytować/usuwać **sale** w ramach lokalizacji:
        - Sala należy tylko do jednej lokalizacji.
        - Sala jest przypisana do jednego lub wielu typów usług (np. Fizjoterapia, Trening personalny, **Inne** - możliwość definiowania przez właściciela, ale bez wpływu na logikę rezerwacji w MVP).
        - Sala posiada swój indywidualny kalendarz.
    - Właściciel może dodawać/zarządzać **pracownikami**:
        - Przypisywanie pracowników do lokalizacji (pracownik może należeć do wielu lokalizacji).
        - Definiowanie **roli/kwalifikacji** pracownika (Fizjoterapeuta, Trener Personalny).
        - Ustalanie **stawki bazowej** pracownika dla każdej lokalizacji (np. 100 zł/h, 150 zł/h). System przechowuje tę stawkę i może wykorzystywać ją do kalkulacji ceny bazowej usługi.
        - Pracownik posiada swój indywidualny kalendarz.
- **Monitoring Obłożenia:**
    - Dedykowany interfejs dla właściciela.
    - Podgląd obłożenia w **czasie rzeczywistym**\* (aktualnego i planowanego):
        - Dla poszczególnych lokalizacji.
        - Dla poszczególnych sal w ramach lokalizacji.
        - Dla poszczególnych pracowników w ramach lokalizacji.
        - Możliwość filtrowania wg typu usługi (Fizjoterapia, Trening Personalny).
- **Monitoring i Zarządzanie Cenami:**
    - Widok (np. w formie kalendarium) pokazujący **aktualne ceny końcowe** dla poszczególnych usług, lokalizacji i terminów (uwzględniając zniżki za "martwe godziny").
    - Możliwość **korygowania parametrów** wpływających na cenę (np. wysokość zniżki za "martwe godziny", definicja tych godzin, ewentualne mnożniki cenowe dla konkretnych terminów).

### 3.5. Funkcjonalności Dodatkowe

- **Notatki po Zajęciach (Opcjonalne dla MVP):**
    - System **powinien** (jako funkcja opcjonalna) umożliwiać pracownikom (szczególnie fizjoterapeutom) dodawanie notatek merytorycznych dotyczących przeprowadzonych sesji.
    - Notatki powiązane z konkretną rezerwacją/wizytą.
    - **Format:** Prosty tekst (obsługa Markdown).
    - **Dostęp (MVP):** Dostęp do odczytu i edycji notatki ma **tylko pracownik**, który ją utworzył. (Dostęp dla właściciela lub klienta jest rozważany jako przyszłe rozszerzenie).

**Podsumowanie zmian i wyjaśnień:**

1. **"Martwe Godziny":** Definicja została sprecyzowana zgodnie z odpowiedzią (przed 16:00 jako MVP, z możliwością konfiguracji i przyszłego rozwoju w kierunku dynamicznego mechanizmu).
2. **"Inne" Aktywności:** Wyjaśniono, że właściciel może definiować inne typy usług, ale MVP skupia się na rezerwacji i logice cenowej tylko dla fizjoterapii i treningu personalnego.
3. **Zarządzanie Użytkownikami i Zasobami:** Dodano sekcję 3.1 opisującą tworzenie kont, role (Właściciel, Pracownik), sposób dodawania pracowników przez właściciela i dołączania pracowników do lokalizacji. Wyjaśniono brak kont klienckich w MVP. Wskazano na potrzebę interfejsu administracyjnego dla właściciela.
4. **Mechanizm Identyfikacji Klienta:** Sprecyzowano, że dane klienta (imię, nazwisko, telefon, e-mail) są zbierane przy każdej rezerwacji (nie ma bazy klientów w MVP). Dodano wymóg płatności do potwierdzenia rezerwacji.
5. **Zapobieganie Konfliktom:** Wzmocniono wymaganie dotyczące zapobiegania podwójnym rezerwacjom poprzez weryfikację dostępności w czasie rzeczywistym przed potwierdzeniem rezerwacji oraz mechanizm sugerowania alternatyw.
6. **Szczegóły Notatek:** Określono format (Markdown) i zakres dostępu (tylko autor notatki w MVP) dla opcjonalnej funkcjonalności notatek.
7. **Różnicowanie Pracowników:** Wyraźnie zaznaczono istnienie ról (Fizjoterapeuta, Trener Personalny) przypisywanych przez właściciela, które wpływają na uprawnienia, widoki i walidację rezerwacji (zgodność typu usługi z kwalifikacjami).
8. **Stawki Pracowników:** Sprecyzowano, że właściciel ustala stawki dla pracowników per lokalizacja. System przechowuje te stawki i wykorzystuje je jako potencjalny element do kalkulacji ceny bazowej usługi, która następnie podlega dynamicznym modyfikacjom (np. zniżka za "martwe godziny"). Skorygowano niejasność dotyczącą "takiej samej stawki".