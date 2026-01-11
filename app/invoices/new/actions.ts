"use server";

import { prisma } from "@/src/lib/prisma";
import {
  invoiceFormSchema,
  InvoiceFormValues,
} from "@/src/features/invoices/invoice.schema";
import { redirect } from "next/navigation";
import { InvoiceStatus, LineItemKind } from "@prisma/client";
import { auth } from "@/src/auth";

export async function createInvoiceAction(data: InvoiceFormValues) {
  // Get current user session for group assignment
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  const { id: userId, groupId } = session.user;

  const result = invoiceFormSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Données invalides");
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
      kind: item.kind as LineItemKind, // Ensure type match
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

  // Create Invoice Transaction (Create Invoice + Update Stock if needed)
  await prisma.$transaction(async (tx) => {
    // 1. Create Invoice with user and group association
    await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        vehicleId: vehicleId || null,
        status: InvoiceStatus.ISSUED, // Default to ISSUED
        issuedAt: new Date(),
        subtotalHt,
        vatTotal,
        totalTtc,
        notes,
        createdById: userId, // Associate with creating user
        groupId: groupId || null, // Associate with user's group for collaborative access
        items: {
          create: itemsData,
        },
      },
    });

    // 2. Update Stock for Parts
    for (const item of itemsData) {
      if (item.kind === "PART" && item.partId) {
        await tx.part.update({
          where: { id: item.partId },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });
      }
    }
  });

  redirect("/invoices");
}
