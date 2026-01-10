import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";
import { updateVehicleAction } from "../actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeleteVehicleButton } from "./DeleteVehicleButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params;

  const [vehicle, customers] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        _count: {
          select: {
            invoices: true,
            quotes: true,
            repairOrders: true,
          },
        },
      },
    }),
    prisma.customer.findMany({
      orderBy: { lastName: "asc" },
    }),
  ]);

  if (!vehicle) {
    notFound();
  }

  const updateWithId = updateVehicleAction.bind(null, id);
  const hasRelations =
    vehicle._count.invoices > 0 ||
    vehicle._count.quotes > 0 ||
    vehicle._count.repairOrders > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modifier le véhicule</h1>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} - {vehicle.registrationPlate}
          </p>
        </div>
        <DeleteVehicleButton vehicleId={id} hasRelations={hasRelations} />
      </div>

      <form action={updateWithId}>
        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
            <CardDescription>Immatriculation et VIN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Immatriculation *</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  defaultValue={vehicle.registrationPlate}
                  className="uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">N° VIN (Châssis)</Label>
                <Input
                  id="vin"
                  name="vin"
                  defaultValue={vehicle.vin || ""}
                  className="uppercase"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations véhicule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={vehicle.make || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  name="model"
                  defaultValue={vehicle.model || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={vehicle.year || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileageKm">Kilométrage</Label>
                <Input
                  id="mileageKm"
                  name="mileageKm"
                  type="number"
                  defaultValue={vehicle.mileageKm}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Propriétaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customerId">Client *</Label>
              <Select name="customerId" defaultValue={vehicle.customerId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName ||
                        `${customer.firstName} ${customer.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {vehicle._count.invoices} facture(s) • {vehicle._count.quotes} devis
            • {vehicle._count.repairOrders} OR
          </div>
          <Button type="submit" size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
