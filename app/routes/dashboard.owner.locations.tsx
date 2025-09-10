/**
 * Route for owner locations management
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Outlet, redirect, useLoaderData } from "react-router";
import { LocationsManager } from "~/components/locations/LocationsManager";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";

import type { LocationFormData } from "~/lib/types";

export function meta() {
  return [
    { title: "Zarządzanie lokalizacjami - Reserve Pro" },
    { name: "description", content: "Zarządzaj swoimi lokalizacjami i salami" },
  ];
}

/**
 * Loader - fetch locations for the owner
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authContainer.rbacService.requireOwner(request);

  try {
    const locations =
      await reservationContainer.locationsRepo.getLocationsWithRoomCountByOwnerId(
        user.user.id
      );

    return {
      locations,
      user,
    };
  } catch (error) {
    console.error("Error loading locations:", error);
    throw new Error("Nie udało się załadować lokalizacji");
  }
}

/**
 * Action - handle location CRUD operations
 */
export async function action({ request }: ActionFunctionArgs) {
  const { user } = await authContainer.rbacService.requireOwner(request);

  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    switch (intent) {
      case "create": {
        const locationData: LocationFormData = {
          name: formData.get("name") as string,
          address: formData.get("address") as string,
          city: formData.get("city") as string,
        };

        // Validate required fields
        if (!locationData.name || !locationData.address || !locationData.city) {
          return {
            error: "Wszystkie pola są wymagane",
          };
        }

        await reservationContainer.locationsRepo.createLocation({
          ...locationData,
          ownerId: user.id,
        });

        return redirect("/dashboard/owner/locations");
      }

      case "update": {
        const locationId = formData.get("locationId") as string;
        const locationData: LocationFormData = {
          name: formData.get("name") as string,
          address: formData.get("address") as string,
          city: formData.get("city") as string,
        };

        // Validate required fields
        if (
          !locationId ||
          !locationData.name ||
          !locationData.address ||
          !locationData.city
        ) {
          return {
            error: "Wszystkie pola są wymagane",
          };
        }

        const updatedLocation =
          await reservationContainer.locationsRepo.updateLocation(
            locationId,
            user.id,
            locationData
          );

        if (!updatedLocation) {
          return {
            error: "Nie znaleziono lokalizacji lub brak uprawnień",
          };
        }

        return redirect("/dashboard/owner/locations");
      }

      case "delete": {
        const locationId = formData.get("locationId") as string;

        if (!locationId) {
          return {
            error: "ID lokalizacji jest wymagane",
          };
        }

        const deleted = await reservationContainer.locationsRepo.deleteLocation(
          locationId,
          user.id
        );

        if (!deleted) {
          return {
            error: "Nie znaleziono lokalizacji lub brak uprawnień",
          };
        }

        return redirect("/dashboard/owner/locations");
      }

      default:
        return {
          error: "Nieznana akcja",
        };
    }
  } catch (error) {
    console.error("Error in locations action:", error);
    return {
      error: "Wystąpił błąd podczas wykonywania operacji",
    };
  }
}

export default function OwnerLocationsPage() {
  const { locations } = useLoaderData<typeof loader>();

  return (
    <>
      <hr className="my-8" />
      <LocationsManager locations={locations} />
      <Outlet />
    </>
  );
}
