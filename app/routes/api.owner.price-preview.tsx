/**
 * API endpoint for price preview
 */
import type { ActionFunctionArgs } from "react-router";
import { authContainer } from "~/lib/auth/container";
import { pricingOccupancyContainer } from "~/lib/pricing/container";
import type { PricePreviewRequest } from "~/lib/pricing/types";

export async function action({ request }: ActionFunctionArgs) {
  const session = await authContainer.sessionService.getSession(request);
  
  if (!session || session.user.role !== "OWNER") {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (request.method !== "POST") {
    return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const previewRequest: PricePreviewRequest = {
      serviceType: body.serviceType,
      locationId: body.locationId,
      employeeId: body.employeeId,
      startTime: body.startTime,
      endTime: body.endTime,
    };

    const result = await pricingOccupancyContainer.pricingConfigService.previewPrice(
      session.user.id, 
      previewRequest
    );

    return Response.json(result);
  } catch (error) {
    console.error("Price preview error:", error);
    return Response.json({ 
      success: false, 
      error: "Failed to calculate price preview" 
    }, { status: 500 });
  }
}
