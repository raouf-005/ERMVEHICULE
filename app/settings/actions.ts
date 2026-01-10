"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanySettingsAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    addressLine1: formData.get("addressLine1") as string,
    postalCode: formData.get("postalCode") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    siret: formData.get("siret") as string,
    vatNumber: formData.get("vatNumber") as string,
    capital: formData.get("capital") as string,
    legalStatus: formData.get("legalStatus") as string,
    website: formData.get("website") as string,
    logoUrl: formData.get("logoUrl") as string,
    invoiceFooter: formData.get("invoiceFooter") as string,
  };

  // Check if exists, update or create
  const existing = await prisma.companySettings.findFirst();

  if (existing) {
    await prisma.companySettings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.companySettings.create({
      data,
    });
  }

  revalidatePath("/settings");
  revalidatePath("/invoices");
}
