import { NextResponse } from "next/server";
import { getAllBizDocuments } from "../../../../services/biz";
import { Parser } from "json2csv";

interface FlattenedBusiness {
  _id: string;
  userId: string;
  title: string;
  type: string;
  city: string;
  phone: string;
  address: string;
  description: string;
  website: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Fetch all businesses from MongoDB
    const businesses = await getAllBizDocuments();

    if (!businesses || businesses.length === 0) {
      return NextResponse.json(
        { error: "No businesses found" },
        { status: 404 },
      );
    }

    // Flatten nested objects for CSV export
    const flattenedBusinesses: FlattenedBusiness[] = businesses.map(
      (business) => {
        const flatBusiness: FlattenedBusiness = {
          _id: business._id?.toString() || "",
          userId: business.userId || "",
          title: business.title || (business.name as string) || "",
          type: business.type || "",
          city: business.city || "",
          phone: business.phone || "",
          address: business.address || "",
          description: business.description || "",
          website: business.website || "",
          email: business.email || "",
          createdAt: business.createdAt
            ? new Date(business.createdAt).toISOString()
            : "",
          updatedAt: business.updatedAt
            ? new Date(business.updatedAt).toISOString()
            : "",
        };

        return flatBusiness;
      },
    );

    // Define CSV fields
    const fields: (keyof FlattenedBusiness)[] = [
      "_id",
      "userId",
      "title",
      "type",
      "city",
      "phone",
      "address",
      "description",
      "website",
      "email",
      "createdAt",
      "updatedAt",
    ];

    // Convert to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(flattenedBusinesses);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="businesses-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting businesses to CSV:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to export businesses", message },
      { status: 500 },
    );
  }
}
