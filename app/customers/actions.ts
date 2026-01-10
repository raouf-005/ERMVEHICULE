"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const customerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
});

export async function updateCustomerAction(id: string, formData: FormData) {
  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    companyName: formData.get("companyName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    addressLine1: formData.get("addressLine1") as string,
    postalCode: formData.get("postalCode") as string,
    city: formData.get("city") as string,
    siret: formData.get("siret") as string,
    vatNumber: formData.get("vatNumber") as string,
  };

  const validated = customerSchema.parse(data);

  await prisma.customer.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomerAction(id: string) {
  // Check if customer has related records
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          vehicles: true,
          invoices: true,
          quotes: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error("Client non trouvé");
  }

  if (customer._count.invoices > 0 || customer._count.quotes > 0) {
    throw new Error(
      "Impossible de supprimer ce client car il a des factures ou devis associés"
    );
  }

  // Delete related vehicles first
  await prisma.vehicle.deleteMany({
    where: { customerId: id },
  });

  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/customers");
}
