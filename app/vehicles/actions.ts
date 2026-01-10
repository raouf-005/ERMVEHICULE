"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const vehicleSchema = z.object({
  licensePlate: z.string().min(1, "Immatriculation requise"),
  customerId: z.string().min(1, "Client requis"),
  brand: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional(),
  year: z.string().optional(),
  mileageKm: z.string().optional(),
});

export async function updateVehicleAction(id: string, formData: FormData) {
  const data = {
    licensePlate: formData.get("licensePlate") as string,
    customerId: formData.get("customerId") as string,
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    vin: formData.get("vin") as string,
    year: formData.get("year") as string,
    mileageKm: formData.get("mileageKm") as string,
  };

  const validated = vehicleSchema.parse(data);

  await prisma.vehicle.update({
    where: { id },
    data: {
      registrationPlate: validated.licensePlate,
      customerId: validated.customerId,
      make: validated.brand,
      model: validated.model,
      vin: validated.vin || null,
      year: validated.year ? parseInt(validated.year) : null,
      mileageKm: validated.mileageKm ? parseInt(validated.mileageKm) : 0,
    },
  });

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function deleteVehicleAction(id: string) {
  // Check if vehicle has related records
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          invoices: true,
          quotes: true,
          repairOrders: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new Error("Véhicule non trouvé");
  }

  if (
    vehicle._count.invoices > 0 ||
    vehicle._count.quotes > 0 ||
    vehicle._count.repairOrders > 0
  ) {
    throw new Error(
      "Impossible de supprimer ce véhicule car il a des factures, devis ou OR associés"
    );
  }

  await prisma.vehicle.delete({
    where: { id },
  });

  revalidatePath("/vehicles");
}
