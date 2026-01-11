import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  Plus,
  Edit,
  Car,
  Gauge,
  Calendar,
  Activity,
  Wrench,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      customer: true,
      _count: {
        select: {
          invoices: true,
          repairOrders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: vehicles.length,
    withOrders: vehicles.filter((v) => v._count.repairOrders > 0).length,
    avgMileage: vehicles.length
      ? Math.round(
          vehicles.reduce((acc, v) => acc + v.mileageKm, 0) / vehicles.length
        )
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Car className="h-8 w-8" />
            Véhicules
          </h1>
          <p className="text-muted-foreground mt-1">
            Parc automobile et historique
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Véhicule
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-600 bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              Parc Automobile
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight">
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              En Intervention
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight">
              {stats.withOrders}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-emerald-600 bg-gradient-to-br from-white to-emerald-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-600" />
              Kilométrage Moy.
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight">
              {stats.avgMileage.toLocaleString()}{" "}
              <span className="text-lg font-medium text-muted-foreground">
                km
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">Immatriculation</TableHead>
                <TableHead>Marque / Modèle</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead className="text-center">Kilométrage</TableHead>
                <TableHead className="text-center">Interventions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-mono font-bold uppercase text-lg">
                          {vehicle.registrationPlate}
                        </div>
                        {vehicle.vin && (
                          <div className="text-xs text-muted-foreground font-mono">
                            VIN: {vehicle.vin.slice(-8)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>
                    {vehicle.year && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {vehicle.year}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customers/${vehicle.customerId}`}
                      className="hover:underline"
                    >
                      {vehicle.customer?.companyName ||
                        `${vehicle.customer?.firstName} ${vehicle.customer?.lastName}`}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      {vehicle.mileageKm.toLocaleString()} km
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Badge variant="outline">
                        {vehicle._count.invoices} fact.
                      </Badge>
                      <Badge variant="secondary">
                        {vehicle._count.repairOrders} OR
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Aucun véhicule trouvé.</p>
                    <Link href="/vehicles/new">
                      <Button variant="link">
                        Ajouter votre premier véhicule
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
