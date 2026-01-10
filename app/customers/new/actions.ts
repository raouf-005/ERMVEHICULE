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
  address: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
});

export async function createCustomerAction(formData: FormData) {
  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    companyName: formData.get("companyName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    siret: formData.get("siret") as string,
    vatNumber: formData.get("vatNumber") as string,
  };

  const validated = customerSchema.parse(data);

  await prisma.customer.create({
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      companyName: validated.companyName,
      email: validated.email,
      phone: validated.phone,
      addressLine1: validated.address,
      siret: validated.siret,
      vatNumber: validated.vatNumber,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}
