/**
 * Strona sukcesu rejestracji
 */
import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Komponent React - strona sukcesu rejestracji
 */
export default function RegisterSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Przekierowanie na stronę główną po 5 sekundach
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    // Czyszczenie timera przy odmontowaniu komponentu
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Rejestracja zakończona sukcesem!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Twoje konto zostało pomyślnie utworzone. Możesz teraz korzystać z wszystkich funkcji aplikacji.
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Za chwilę zostaniesz przekierowany na stronę główną...
          </p>
          <div className="mt-6">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-5000 ease-linear"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <a
              href="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Przejdź do strony głównej teraz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
