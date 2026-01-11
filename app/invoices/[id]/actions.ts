"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";

export async function updateInvoiceStatusAction(id: string, newStatus: string) {
  // Simple status update
  await prisma.invoice.update({
    where: { id },
    data: {
      status: newStatus as InvoiceStatus, // "DRAFT" | "ISSUED" | "PAID" | "CANCELED"
      // If setting to PAID, could update paidAt
      paidAt: newStatus === "PAID" ? new Date() : undefined,
    },
  });

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}
