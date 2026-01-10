import { prisma } from "@/src/lib/prisma";
import { createVehicleAction } from "./actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import Link from "next/link";

export default async function NewVehiclePage() {
  const customers = await prisma.customer.findMany({
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau Véhicule</h1>
        <p className="text-muted-foreground">
          Remplissez les informations du véhicule
        </p>
      </div>

      <form
        action={createVehicleAction}
        className="space-y-6 border p-6 rounded-lg bg-card"
      >
        <div className="space-y-2">
          <Label htmlFor="customerId">Client *</Label>
          <Select name="customerId" required>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.companyName
                    ? `${c.companyName} (${c.firstName} ${c.lastName})`
                    : `${c.firstName} ${c.lastName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Immatriculation *</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              placeholder="ex: AA-123-BB"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marque *</Label>
            <Input id="brand" name="brand" placeholder="ex: Renault" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle *</Label>
            <Input id="model" name="model" placeholder="ex: Clio IV" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vin">VIN (Numéro de série)</Label>
          <Input id="vin" name="vin" placeholder="17 caractères" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Année</Label>
            <Input id="year" name="year" type="number" min="1900" max="2100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileageKm">Kilométrage (km)</Label>
            <Input id="mileageKm" name="mileageKm" type="number" min="0" />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Enregistrer le véhicule
          </Button>
        </div>
      </form>
    </div>
  );
}
