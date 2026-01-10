import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      select: {
        id: true,
        name: true,
        salePriceHt: true,
        vatRate: true,
        stockQty: true,
        lowStockThreshold: true,
      },
      orderBy: { name: "asc" },
    });

    // Convert Decimal fields to plain numbers for JSON serialization
    const serialized = parts.map((p) => ({
      id: p.id,
      name: p.name,
      salePriceHt: Number(p.salePriceHt),
      vatRate: Number(p.vatRate),
      stockQty: p.stockQty,
      lowStockThreshold: p.lowStockThreshold,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/parts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
