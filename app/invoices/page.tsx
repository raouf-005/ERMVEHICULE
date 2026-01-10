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
import { Badge } from "@/src/components/ui/badge";
import {
  Plus,
  Eye,
  Pencil,
  FileText,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const statusConfig = {
  DRAFT: { label: "Brouillon", variant: "secondary" as const, icon: FileText },
  ISSUED: { label: "Émise", variant: "default" as const, icon: Clock },
  PAID: { label: "Payée", variant: "default" as const, icon: CheckCircle },
  CANCELED: {
    label: "Annulée",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

export default async function InvoicesListPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, vehicle: true },
  });

  // Stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "DRAFT").length,
    issued: invoices.filter((i) => i.status === "ISSUED").length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    totalPaid: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.totalTtc), 0),
    totalPending: invoices
      .filter((i) => i.status === "ISSUED")
      .reduce((sum, i) => sum + Number(i.totalTtc), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Factures
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion et suivi de vos factures
          </p>
        </div>
        <Link href="/invoices/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Factures</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.draft} brouillon(s), {stats.issued} émise(s), {stats.paid}{" "}
              payée(s)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Encaissé</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.totalPaid.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.paid} facture(s) payée(s)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {stats.totalPending.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.issued} facture(s) à encaisser
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardHeader className="pb-2">
            <CardDescription>Brouillons</CardDescription>
            <CardTitle className="text-2xl">{stats.draft}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">À finaliser</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucune facture. Créez votre première facture !
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const config =
                    statusConfig[invoice.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="hover:underline text-blue-600"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {invoice.issuedAt
                          ? new Date(invoice.issuedAt).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {invoice.customer.companyName ||
                          `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                      </TableCell>
                      <TableCell>
                        {invoice.vehicle
                          ? `${invoice.vehicle.registrationPlate}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config?.variant || "secondary"}>
                          {config?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {Number(invoice.totalTtc).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {(invoice.status === "DRAFT" ||
                            invoice.status === "ISSUED") && (
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
