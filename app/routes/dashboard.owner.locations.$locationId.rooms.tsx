import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "react-router";
import { z } from "zod";
import { RoomsManager } from "~/components/rooms/RoomsManager";
import { authContainer } from "~/lib/auth/container";
import { reservationContainer } from "~/lib/reservation/container";

const roomFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa jest wymagana")
    .max(100, "Nazwa nie może być dłuższa niż 100 znaków"),
  serviceTypes: z.array(z.string()),
  capacity: z
    .number()
    .min(1, "Minimalna pojemność to 1")
    .max(20, "Maksymalna pojemność to 20"),
  equipment: z.array(z.string()),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authContainer.rbacService.requireOwner(request);
  const { locationId } = params;

  if (!locationId) {
    throw new Response("Missing locationId", { status: 400 });
  }

  const rooms =
    await reservationContainer.roomsRepo.getRoomsByLocationId(locationId);

  return json({ rooms, locationId });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { user } = await authContainer.rbacService.requireOwner(request);
  const { locationId } = params;

  if (!locationId) {
    throw new Response("Missing locationId", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      try {
        const data = roomFormSchema.parse({
          name: formData.get("name"),
          serviceTypes: formData.getAll("serviceTypes"),
          capacity: Number(formData.get("capacity")),
          equipment:
            formData
              .get("equipment")
              ?.toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean) || [],
        });

        const room = await reservationContainer.roomsRepo.createRoom(
          locationId,
          user.id,
          data
        );
        if (!room) {
          return json({ error: "Failed to create room" }, { status: 400 });
        }

        return json({ room });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return json({ errors: error.flatten().fieldErrors }, { status: 400 });
        }
        throw error;
      }
    }
    case "update": {
      const roomId = formData.get("roomId");
      if (!roomId || typeof roomId !== "string") {
        return json({ error: "Room ID is required" }, { status: 400 });
      }

      try {
        const data = roomFormSchema.parse({
          name: formData.get("name"),
          serviceTypes: formData.getAll("serviceTypes"),
          capacity: Number(formData.get("capacity")),
          equipment:
            formData
              .get("equipment")
              ?.toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean) || [],
        });

        const room = await reservationContainer.roomsRepo.updateRoom(
          roomId,
          user.id,
          data
        );
        if (!room) {
          return json({ error: "Failed to update room" }, { status: 400 });
        }

        return json({ room });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return json({ errors: error.flatten().fieldErrors }, { status: 400 });
        }
        throw error;
      }
    }
    case "delete": {
      const roomId = formData.get("roomId");
      if (!roomId || typeof roomId !== "string") {
        return json({ error: "Room ID is required" }, { status: 400 });
      }

      const success = await reservationContainer.roomsRepo.deleteRoom(
        roomId,
        user.id
      );
      if (!success) {
        return json({ error: "Failed to delete room" }, { status: 400 });
      }

      return json({ success: true });
    }
    default: {
      return json({ error: "Invalid intent" }, { status: 400 });
    }
  }
}

export default function LocationRoomsRoute() {
  const { rooms, locationId } = useLoaderData<typeof loader>();

  return (
    <div>
      <hr className="my-8" />
      <RoomsManager locationId={locationId} rooms={rooms} />
      <Outlet />
    </div>
  );
}
