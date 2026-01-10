import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = customers.map((c) => ({
      id: c.id,
      label:
        c.companyName ??
        [c.firstName, c.lastName].filter(Boolean).join(" ") ??
        "—",
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
