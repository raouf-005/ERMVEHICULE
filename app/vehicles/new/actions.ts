"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const vehicleSchema = z.object({
  licensePlate: z.string().min(1, "Immatriculation requise"),
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  vin: z.string().optional(),
  year: z.coerce.number().optional(),
  mileageKm: z.coerce.number().optional(),
  customerId: z.string().min(1, "Client requis"),
});

export async function createVehicleAction(formData: FormData) {
  const data = {
    licensePlate: formData.get("licensePlate") as string,
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    vin: formData.get("vin") as string,
    year: formData.get("year"),
    mileageKm: formData.get("mileageKm"),
    customerId: formData.get("customerId") as string,
  };

  const validated = vehicleSchema.parse(data);

  await prisma.vehicle.create({
    data: validated,
  });

  revalidatePath("/vehicles");
  redirect("/vehicles");
}
