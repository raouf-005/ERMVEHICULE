import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if user can access this invoice
 */
async function canAccessInvoice(
  invoiceId: string,
  userId: string,
  role: string,
  groupId: string | null
): Promise<boolean> {
  if (role === "ADMIN") return true;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { createdById: true, groupId: true },
  });

  if (!invoice) return false;

  // User created this invoice
  if (invoice.createdById === userId) return true;

  // User's group owns this invoice
  if (groupId && invoice.groupId === groupId) return true;

  return false;
}

/**
 * GET /api/invoices/[id]
 * Get a single invoice with all details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: userId, role, groupId } = session.user;

    const canAccess = await canAccessInvoice(id, userId, role, groupId);
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        items: {
          orderBy: { position: "asc" },
          include: { part: true },
        },
        quote: true,
        repairOrder: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Serialize Decimal values
    const serializedInvoice = JSON.parse(JSON.stringify(invoice));

    return NextResponse.json(serializedInvoice);
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice (only DRAFT or CANCELED)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: userId, role, groupId } = session.user;

    const canAccess = await canAccessInvoice(id, userId, role, groupId);
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Cannot delete a paid invoice" },
        { status: 400 }
      );
    }

    if (invoice.status === "ISSUED") {
      return NextResponse.json(
        { error: "Cannot delete an issued invoice. Cancel it first." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
