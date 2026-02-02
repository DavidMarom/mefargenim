import { NextResponse } from "next/server";
import { getBusinessById } from "../../../../services/biz";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    // In Next.js 16, params might be a Promise, so we await it
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    const business = await getBusinessById(id);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error: unknown) {
    console.error("Error fetching business:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch business", message },
      { status: 500 },
    );
  }
}
