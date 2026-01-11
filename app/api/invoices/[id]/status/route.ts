import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { InvoiceStatus } from "@prisma/client";

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
 * PATCH /api/invoices/[id]/status
 * Update invoice status with optimistic locking
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const data = await request.json();
    const { status } = data;

    if (!["DRAFT", "ISSUED", "PAID", "CANCELED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update invoice status
    const updateData: any = {
      status: status as InvoiceStatus,
    };

    // Set dates based on status change
    if (status === "ISSUED" && invoice.status === "DRAFT") {
      updateData.issuedAt = new Date();
    } else if (status === "PAID") {
      updateData.paidAt = new Date();
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        paidAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/invoices/[id]/status error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    );
  }
}
