"use client";

import {
  useInvoices,
  useUpdateInvoiceStatus,
  InvoiceListItem,
} from "@/src/hooks/useInvoices";
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
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useTransition, useState, useCallback } from "react";

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

function InvoiceRow({ invoice }: { invoice: InvoiceListItem }) {
  const config = statusConfig[invoice.status];
  const { updateStatus, isPending } = useUpdateInvoiceStatus();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuickStatusChange = async (newStatus: "ISSUED" | "PAID") => {
    setIsUpdating(true);
    try {
      await updateStatus(invoice.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const customerName =
    invoice.customer.companyName ||
    `${invoice.customer.firstName || ""} ${
      invoice.customer.lastName || ""
    }`.trim() ||
    "Client inconnu";

  return (
    <TableRow className={isUpdating ? "opacity-50" : ""}>
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
          ? new Date(invoice.issuedAt).toLocaleDateString("fr-FR")
          : "-"}
      </TableCell>
      <TableCell>{customerName}</TableCell>
      <TableCell>
        {invoice.vehicle ? invoice.vehicle.registrationPlate : "-"}
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
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {invoice.status === "DRAFT" && (
            <>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickStatusChange("ISSUED")}
                disabled={isUpdating}
                title="Émettre"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          {invoice.status === "ISSUED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickStatusChange("PAID")}
              disabled={isUpdating}
              title="Marquer payée"
              className="text-green-600 hover:text-green-700"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function InvoicesList() {
  const { invoices, stats, isLoading, isValidating, refreshInvoices } =
    useInvoices();

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInvoices}
            disabled={isValidating}
          >
            <RefreshCw
              className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`}
            />
          </Button>
          <Link href="/invoices/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Facture
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards with live updates */}
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

      {/* Table with loading state */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement...</span>
            </div>
          ) : (
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
                  invoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Real-time indicator */}
      {isValidating && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Synchronisation...
        </div>
      )}
    </div>
  );
}
