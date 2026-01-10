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
import { Plus, Edit, Users, Mail, Phone, Building2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { lastName: "asc" },
    include: {
      _count: {
        select: {
          vehicles: true,
          invoices: true,
        },
      },
    },
  });

  const stats = {
    total: customers.length,
    business: customers.filter((c) => c.companyName).length,
    withVehicles: customers.filter((c) => c._count.vehicles > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion de votre base clients
          </p>
        </div>
        <Link href="/customers/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Client
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total clients</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Professionnels</CardDescription>
            <CardTitle className="text-3xl">{stats.business}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avec véhicules</CardDescription>
            <CardTitle className="text-3xl">{stats.withVehicles}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">Nom / Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Véhicules</TableHead>
                <TableHead className="text-center">Factures</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {customer.companyName ? (
                          <Building2 className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="text-primary font-semibold">
                            {customer.firstName?.[0]}
                            {customer.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.companyName ||
                            `${customer.firstName} ${customer.lastName}`}
                        </div>
                        {customer.companyName && (
                          <div className="text-sm text-muted-foreground">
                            {customer.firstName} {customer.lastName}
                          </div>
                        )}
                        {customer.siret && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            SIRET: {customer.siret}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{customer._count.vehicles}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{customer._count.invoices}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Aucun client trouvé.</p>
                    <Link href="/customers/new">
                      <Button variant="link">Créer votre premier client</Button>
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
