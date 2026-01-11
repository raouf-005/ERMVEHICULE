"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  invoiceFormSchema,
  InvoiceFormValues,
} from "@/src/features/invoices/invoice.schema";
import { InvoiceStatus, LineItemKind } from "@prisma/client";
import { auth } from "@/src/auth";

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
  if (invoice.createdById === userId) return true;
  if (groupId && invoice.groupId === groupId) return true;

  return false;
}

/**
 * Update an existing invoice (header + items).
 * Only allowed if status is DRAFT or ISSUED.
 */
export async function updateInvoiceAction(
  invoiceId: string,
  data: InvoiceFormValues
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  const { id: userId, role, groupId } = session.user;

  // Check permission
  const hasAccess = await canAccessInvoice(invoiceId, userId, role, groupId);
  if (!hasAccess) {
    throw new Error("Accès non autorisé à cette facture");
  }

  const result = invoiceFormSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Données invalides");
  }

  const existing = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { status: true },
  });

  if (!existing) {
    throw new Error("Facture introuvable");
  }

  if (existing.status === "PAID" || existing.status === "CANCELED") {
    throw new Error(
      "Impossible de modifier une facture payée ou annulée. Créez un avoir."
    );
  }

  const { invoiceNumber, customerId, vehicleId, notes, items } = result.data;

  // Calculate totals
  let subtotalHt = 0;
  let vatTotal = 0;

  const itemsData = items.map((item, index) => {
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

  await prisma.$transaction(async (tx) => {
    // Delete old items
    await tx.invoiceItem.deleteMany({
      where: { invoiceId },
    });

    // Update invoice header + create new items
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber,
        customerId,
        vehicleId: vehicleId || null,
        notes,
        subtotalHt,
        vatTotal,
        totalTtc,
        items: {
          create: itemsData,
        },
      },
    });
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  redirect(`/invoices/${invoiceId}`);
}

/**
 * Delete an invoice. Only DRAFT or CANCELED invoices can be deleted.
 * For ISSUED/PAID invoices, user should cancel first.
 */
export async function deleteInvoiceAction(invoiceId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  const { id: userId, role, groupId } = session.user;

  // Check permission
  const hasAccess = await canAccessInvoice(invoiceId, userId, role, groupId);
  if (!hasAccess) {
    throw new Error("Accès non autorisé à cette facture");
  }

  const existing = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { status: true },
  });

  if (!existing) {
    throw new Error("Facture introuvable");
  }

  if (existing.status === "PAID") {
    throw new Error(
      "Impossible de supprimer une facture payée. Annulez-la d'abord."
    );
  }

  if (existing.status === "ISSUED") {
    throw new Error(
      "Impossible de supprimer une facture émise. Annulez-la d'abord."
    );
  }

  await prisma.$transaction(async (tx) => {
    // Delete items first
    await tx.invoiceItem.deleteMany({
      where: { invoiceId },
    });
    // Delete invoice
    await tx.invoice.delete({
      where: { id: invoiceId },
    });
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

/**
 * Duplicate an invoice (creates a new DRAFT with same content).
 */
export async function duplicateInvoiceAction(invoiceId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  const { id: userId, role, groupId } = session.user;

  // Check permission
  const hasAccess = await canAccessInvoice(invoiceId, userId, role, groupId);
  if (!hasAccess) {
    throw new Error("Accès non autorisé à cette facture");
  }

  const original = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!original) {
    throw new Error("Facture introuvable");
  }

  // Generate new invoice number
  const count = await prisma.invoice.count();
  const newNumber = `FAC-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(4, "0")}`;

  const newInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: newNumber,
      customerId: original.customerId,
      vehicleId: original.vehicleId,
      status: InvoiceStatus.DRAFT,
      notes: original.notes,
      subtotalHt: original.subtotalHt,
      vatTotal: original.vatTotal,
      totalTtc: original.totalTtc,
      createdById: userId, // New invoice belongs to current user
      groupId: groupId || original.groupId, // Keep in same group or user's group
      items: {
        create: original.items.map((item, index) => ({
          kind: item.kind,
          partId: item.partId,
          description: item.description,
          quantity: item.quantity,
          unitPriceHt: item.unitPriceHt,
          vatRate: item.vatRate,
          lineTotalHt: item.lineTotalHt,
          lineTotalTtc: item.lineTotalTtc,
          position: index,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${newInvoice.id}/edit`);
}

/**
 * Cancel an invoice (set status to CANCELED).
 */
export async function cancelInvoiceAction(invoiceId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  const { id: userId, role, groupId } = session.user;

  // Check permission
  const hasAccess = await canAccessInvoice(invoiceId, userId, role, groupId);
  if (!hasAccess) {
    throw new Error("Accès non autorisé à cette facture");
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: InvoiceStatus.CANCELED,
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
