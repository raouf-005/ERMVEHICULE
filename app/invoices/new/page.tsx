import { prisma } from "@/src/lib/prisma";
import { InvoiceForm } from "@/src/features/invoices/InvoiceForm";
import { createInvoiceAction } from "./actions";

export default async function NewInvoicePage() {
  const parts = await prisma.part.findMany();
  const customers = await prisma.customer.findMany();
  const vehicles = await prisma.vehicle.findMany();

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
        customers={serialize(customers)}
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
