"use client";

import dynamic from "next/dynamic";
import { Button } from "@/src/components/ui/button";
import type {
  Invoice,
  Customer,
  InvoiceItem,
  Vehicle,
  Quote,
  RepairOrder,
  Part,
  CompanySettings,
} from "@prisma/client";

// Define the type here as well to satisfy the prop interface
type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: (InvoiceItem & { part?: Part | null })[];
  vehicle?: Vehicle | null;
  quote?: Quote | null;
  repairOrder?: RepairOrder | null;
};

// Dynamically import the implementation component
// This ensures that @react-pdf/renderer is strictly loaded on the client side
// and separated from the main bundle, avoiding ESM resolution errors.
const InvoiceDownloadButtonImpl = dynamic(
  () => import("./InvoiceDownloadButtonImpl"),
  {
    ssr: false,
    loading: () => (
      <Button disabled variant="outline">
        Chargement PDF...
      </Button>
    ),
  }
);

interface InvoiceDownloadButtonProps {
  invoice: InvoiceWithRelations;
  companySettings?: CompanySettings | null;
}

export function InvoiceDownloadButton({
  invoice,
  companySettings,
}: InvoiceDownloadButtonProps) {
  return (
    <InvoiceDownloadButtonImpl
      invoice={invoice}
      companySettings={companySettings}
    />
  );
}
