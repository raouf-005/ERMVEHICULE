import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { InvoiceStatus, LineItemKind } from "@prisma/client";

/**
 * GET /api/invoices
 * Returns invoices filtered by user's group (collaborative access)
 * Admins see all invoices, users see their own + group invoices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, groupId } = session.user;

    // Build where clause based on user role and group
    let whereClause: any = {};

    if (role !== "ADMIN") {
      // Non-admins see: their own invoices OR invoices from their group
      whereClause = {
        OR: [
          { createdById: userId },
          ...(groupId ? [{ groupId: groupId }] : []),
        ],
      };
    }
    // Admins see all invoices (no where clause)

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        totalTtc: true,
        createdAt: true,
        createdById: true,
        groupId: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            registrationPlate: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === "DRAFT").length,
      issued: invoices.filter((i) => i.status === "ISSUED").length,
      paid: invoices.filter((i) => i.status === "PAID").length,
      totalPaid: invoices
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + Number(i.totalTtc), 0),
      totalPending: invoices
        .filter((i) => i.status === "ISSUED")
        .reduce((sum, i) => sum + Number(i.totalTtc), 0),
    };

    // Serialize Decimal values
    const serializedInvoices = invoices.map((inv) => ({
      ...inv,
      totalTtc: Number(inv.totalTtc),
    }));

    return NextResponse.json({
      invoices: serializedInvoices,
      stats,
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice with user and group association
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, groupId } = session.user;
    const data = await request.json();

    const { invoiceNumber, customerId, vehicleId, notes, items = [] } = data;

    // Calculate totals
    let subtotalHt = 0;
    let vatTotal = 0;

    const itemsData = items.map((item: any, index: number) => {
      const lineHt = item.quantity * item.unitPriceHt;
      const lineVat = lineHt * (item.vatRate / 100);
      const lineTtc = lineHt + lineVat;

      subtotalHt += lineHt;
      vatTotal += lineVat;

      return {
        kind: item.kind as LineItemKind,
        partId: item.partId || null,
        description: item.description,
        quantity: item.quantity,
        unitPriceHt: item.unitPriceHt,
        vatRate: item.vatRate,
        lineTotalHt: lineHt,
        lineTotalTtc: lineTtc,
        position: index,
      };
    });

    const totalTtc = subtotalHt + vatTotal;

    // Generate invoice number if not provided
    const finalInvoiceNumber = invoiceNumber || (await generateInvoiceNumber());

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        customerId,
        vehicleId: vehicleId || null,
        notes,
        status: InvoiceStatus.DRAFT,
        subtotalHt,
        vatTotal,
        totalTtc,
        createdById: userId,
        groupId: groupId || null,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  return `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(
    4,
    "0"
  )}`;
}
