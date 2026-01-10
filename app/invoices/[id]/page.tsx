import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceDownloadButton } from "@/src/features/invoices/InvoiceDownloadButton";
import { InvoiceStatusActions } from "@/src/features/invoices/InvoiceStatusActions";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge"; // Check if Badge exists, if not use span or create it

// Helper for Badge if not exists (I'll check later, assume basic UI)
function StatusBadge({ status }: { status: string }) {
  const colors = {
    DRAFT: "bg-gray-500",
    ISSUED: "bg-blue-500",
    PAID: "bg-green-500",
    CANCELED: "bg-red-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-white text-xs ${
        colors[status as keyof typeof colors] || "bg-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; // Next.js 15 requires awaiting params

  const [invoice, companySettings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          orderBy: { position: "asc" },
          include: { part: true },
        },
        vehicle: true,
        quote: true,
        repairOrder: true,
      },
    }),
    prisma.companySettings.findFirst(),
  ]);

  if (!invoice) return notFound();

  // Serializing ensures Decimal types are converted to strings/numbers
  // safe for Client Components.
  const serializedInvoice = JSON.parse(JSON.stringify(invoice));
  const serializedSettings = companySettings
    ? JSON.parse(JSON.stringify(companySettings))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Facture {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">
            {invoice.customer.companyName ||
              `${invoice.customer.firstName} ${invoice.customer.lastName}`}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Status Actions */}
          <InvoiceStatusActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          {/* Download Button */}
          <InvoiceDownloadButton
            invoice={serializedInvoice}
            companySettings={serializedSettings}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut:</span>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d'émission:</span>
              <span>
                {invoice.issuedAt
                  ? new Date(invoice.issuedAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d'échéance:</span>
              <span>
                {invoice.dueAt
                  ? new Date(invoice.dueAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Client Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">
              {invoice.customer.companyName ||
                `${invoice.customer.firstName} ${invoice.customer.lastName}`}
            </p>
            <p>{invoice.customer.addressLine1}</p>
            {invoice.customer.addressLine2 && (
              <p>{invoice.customer.addressLine2}</p>
            )}
            <p>
              {invoice.customer.postalCode} {invoice.customer.city}
            </p>
            <p>{invoice.customer.country}</p>
            {invoice.customer.siret && (
              <p className="text-sm text-gray-500 mt-2">
                SIRET: {invoice.customer.siret}
              </p>
            )}
            {invoice.customer.vatNumber && (
              <p className="text-sm text-gray-500">
                TVA: {invoice.customer.vatNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Card */}
        <Card>
          <CardHeader>
            <CardTitle>Véhicule</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.vehicle ? (
              <div className="space-y-1">
                <p className="font-semibold">
                  {invoice.vehicle.make} {invoice.vehicle.model}
                </p>
                <p>Immat: {invoice.vehicle.registrationPlate}</p>
                <p>VIN: {invoice.vehicle.vin}</p>
                <p>Km: {invoice.vehicle.mileageKm}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun véhicule associé</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Qté</TableHead>
                <TableHead className="text-right">P.U. HT</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-center">
                    {Number(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.unitPriceHt).toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.vatRate)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.lineTotalHt).toFixed(2)} €
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end mt-6 space-y-2">
            <div className="flex w-64 justify-between">
              <span className="text-muted-foreground">Total HT:</span>
              <span>{Number(invoice.subtotalHt).toFixed(2)} €</span>
            </div>
            <div className="flex w-64 justify-between">
              <span className="text-muted-foreground">Total TVA:</span>
              <span>{Number(invoice.vatTotal).toFixed(2)} €</span>
            </div>
            <div className="flex w-64 justify-between font-bold text-lg border-t pt-2">
              <span>Net à payer:</span>
              <span className="text-blue-600">
                {Number(invoice.totalTtc).toFixed(2)} €
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
