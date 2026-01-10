import { prisma } from "@/src/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { InvoiceForm } from "@/src/features/invoices/InvoiceForm";
import { updateInvoiceAction } from "../../actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      items: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!invoice) {
    return notFound();
  }

  // Only DRAFT or ISSUED invoices can be edited
  if (invoice.status === "PAID" || invoice.status === "CANCELED") {
    redirect(`/invoices/${id}`);
  }

  const [parts, customers, vehicles] = await Promise.all([
    prisma.part.findMany({
      select: {
        id: true,
        name: true,
        salePriceHt: true,
        vatRate: true,
        stockQty: true,
        lowStockThreshold: true,
      },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
      },
    }),
    prisma.vehicle.findMany({
      select: {
        id: true,
        registrationPlate: true,
      },
    }),
  ]);

  // Serialize for client components
  const serialize = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

  const partsData = serialize(
    parts.map((p) => ({
      id: p.id,
      name: p.name,
      salePriceHt: Number(p.salePriceHt),
      vatRate: Number(p.vatRate),
      stockQty: p.stockQty,
      lowStockThreshold: p.lowStockThreshold,
    }))
  );

  const customersData = customers.map((c) => ({
    id: c.id,
    label: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  const vehiclesData = vehicles.map((v) => ({
    id: v.id,
    registrationPlate: v.registrationPlate,
  }));

  // Convert invoice items to form format
  const itemsData = invoice.items.map((item) => ({
    kind: item.kind as "PART" | "LABOR",
    partId: item.partId,
    description: item.description,
    quantity: Number(item.quantity),
    unitPriceHt: Number(item.unitPriceHt),
    vatRate: Number(item.vatRate),
  }));

  const defaultValues = {
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customerId,
    vehicleId: invoice.vehicleId,
    notes: invoice.notes || "",
    items: itemsData,
  };

  // Bind action with invoice ID
  const handleUpdate = async (data: any) => {
    "use server";
    return updateInvoiceAction(id, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Modifier la facture</h1>
          <p className="text-muted-foreground">
            {invoice.invoiceNumber} —{" "}
            {invoice.customer.companyName ||
              `${invoice.customer.firstName} ${invoice.customer.lastName}`}
          </p>
        </div>
        <Badge
          variant={invoice.status === "DRAFT" ? "secondary" : "default"}
          className="text-sm"
        >
          {invoice.status === "DRAFT" ? "Brouillon" : "Émise"}
        </Badge>
      </div>

      {invoice.status === "ISSUED" && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Cette facture a déjà été émise. Les modifications seront
                enregistrées mais vérifiez la conformité légale.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <InvoiceForm
        parts={partsData}
        customers={customersData}
        vehicles={vehiclesData}
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
