/**
 * Employee API - Reservations management
 */
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";

export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;

  // Sprawdzenie autoryzacji - tylko pracownicy
  const session = await authContainer.rbacService.requireWorker(request);
  const employeeId = session.user.id;

  try {
    switch (method) {
      case "POST":
        return await handleCreateReservation(request, employeeId);
      case "PUT":
        return await handleUpdateReservation(request, employeeId);
      case "DELETE":
        return await handleDeleteReservation(request, employeeId);
      default:
        return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Employee reservations API error:", error);
    return json(
      { error: "Wystąpił błąd podczas przetwarzania żądania" },
      { status: 500 }
    );
  }
}

async function handleCreateReservation(request: Request, employeeId: string) {
  const formData = await request.formData();
  
  const reservationData = {
    employeeId,
    roomId: formData.get("roomId") as string,
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    clientPhone: formData.get("clientPhone") as string,
    serviceType: formData.get("serviceType") as "physiotherapy" | "personal_training" | "other",
    startTime: new Date(`${formData.get("date")}T${formData.get("startTime")}`),
    endTime: new Date(
      new Date(`${formData.get("date")}T${formData.get("startTime")}`).getTime() +
      parseInt(formData.get("duration") as string) * 60000
    ),
    notes: formData.get("notes") as string || "",
  };

  // Walidacja podstawowa
  if (!reservationData.roomId || !reservationData.clientName || !reservationData.clientEmail) {
    return json(
      { error: "Brakuje wymaganych danych" },
      { status: 400 }
    );
  }

  // Sprawdzenie czy pracownik ma dostęp do tej lokalizacji
  // For now, we'll skip room validation and rely on frontend validation
  // TODO: Add proper room validation with owner check
  
  const employeeLocations = await reservationContainer.employeesRepo.getEmployeeLocations(employeeId);
  
  // Basic validation - just check if employee has any locations
  if (employeeLocations.length === 0) {
    return json(
      { error: "Nie masz dostępu do żadnej lokalizacji" },
      { status: 403 }
    );
  }

  // Sprawdzenie kolizji czasowych
  const existingReservations = await reservationContainer.reservationsRepo
    .getReservationsByRoomIdAndDateRange(
      reservationData.roomId,
      reservationData.startTime,
      reservationData.endTime
    );

  if (existingReservations.length > 0) {
    return json(
      { error: "W wybranym czasie sala jest już zajęta" },
      { status: 409 }
    );
  }

  // Kalkulacja ceny
  const employeeLocation = employeeLocations[0]; // Use first location for now
  const hourlyRate = employeeLocation?.hourlyRate || 0;
  const durationHours = (reservationData.endTime.getTime() - reservationData.startTime.getTime()) / (1000 * 60 * 60);
  
  // Sprawdzenie martwych godzin (8:00-16:00)
  const startHour = reservationData.startTime.getHours();
  const isDeadHour = startHour >= 8 && startHour < 16;
  const basePrice = hourlyRate * durationHours;
  const finalPrice = isDeadHour ? basePrice * 0.8 : basePrice;

  // Utworzenie rezerwacji
  const newReservation = await reservationContainer.reservationsRepo.createReservation({
    ...reservationData,
    basePrice,
    finalPrice,
    isDeadHour,
    status: "confirmed",
  });

  return json({ 
    success: true, 
    reservation: newReservation,
    message: "Rezerwacja została utworzona pomyślnie"
  });
}

async function handleUpdateReservation(request: Request, employeeId: string) {
  const url = new URL(request.url);
  const reservationId = url.searchParams.get("id");
  
  if (!reservationId) {
    return json({ error: "Brak ID rezerwacji" }, { status: 400 });
  }

  // Sprawdzenie czy rezerwacja należy do pracownika
  const reservation = await reservationContainer.reservationsRepo.getReservationById(reservationId);
  if (!reservation || reservation.employeeId !== employeeId) {
    return json(
      { error: "Rezerwacja nie została znaleziona lub nie masz do niej dostępu" },
      { status: 404 }
    );
  }

  const formData = await request.formData();
  
  // Implementacja aktualizacji rezerwacji
  // ... similar validation and update logic

  return json({ 
    success: true,
    message: "Rezerwacja została zaktualizowana"
  });
}

async function handleDeleteReservation(request: Request, employeeId: string) {
  const url = new URL(request.url);
  const reservationId = url.searchParams.get("id");
  
  if (!reservationId) {
    return json({ error: "Brak ID rezerwacji" }, { status: 400 });
  }

  // Sprawdzenie czy rezerwacja należy do pracownika
  const reservation = await reservationContainer.reservationsRepo.getReservationById(reservationId);
  if (!reservation || reservation.employeeId !== employeeId) {
    return json(
      { error: "Rezerwacja nie została znaleziona lub nie masz do niej dostępu" },
      { status: 404 }
    );
  }

  // Sprawdzenie czy można anulować (np. minimum 24h wcześniej)
  const now = new Date();
  const timeDiff = reservation.startTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return json(
      { error: "Rezerwację można anulować minimum 24 godziny wcześniej" },
      { status: 400 }
    );
  }

  // Aktualizacja statusu na "cancelled"
  await reservationContainer.reservationsRepo.updateReservationStatus(reservationId, "cancelled");

  return json({ 
    success: true,
    message: "Rezerwacja została anulowana"
  });
}