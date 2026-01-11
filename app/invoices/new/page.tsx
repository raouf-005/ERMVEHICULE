import { prisma } from "@/src/lib/prisma";
import { InvoiceForm } from "@/src/features/invoices/InvoiceForm";
import { createInvoiceAction } from "./actions";

export default async function NewInvoicePage() {
  const parts = await prisma.part.findMany();
  const customersRaw = await prisma.customer.findMany();
  const vehicles = await prisma.vehicle.findMany();

  // Formater les clients avec un label lisible
  const customers = customersRaw.map((c) => ({
    id: c.id,
    label:
      c.companyName ||
      `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
      "Client sans nom",
  }));

  // Serialization helper
  const serialize = (data: any) => JSON.parse(JSON.stringify(data));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle Facture</h1>
        <p className="text-muted-foreground">
          Créez une nouvelle facture pour un client
        </p>
      </div>
      <InvoiceForm
        parts={serialize(parts)}
        customers={customers}
        vehicles={serialize(vehicles)}
        onSubmit={createInvoiceAction}
        defaultValues={{
          invoiceNumber: `FAC-${new Date().getFullYear()}-${Math.floor(
            Math.random() * 10000
          )}`, // Auto-gen suggestion
        }}
      />
    </div>
  );
}
