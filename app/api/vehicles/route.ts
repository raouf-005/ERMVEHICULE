import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        registrationPlate: true,
      },
      orderBy: { registrationPlate: "asc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
