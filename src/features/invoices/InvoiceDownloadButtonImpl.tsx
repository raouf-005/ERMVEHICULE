"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/src/components/pdf/InvoicePDF";
import { Button } from "@/src/components/ui/button";
import {
  Invoice,
  Customer,
  InvoiceItem,
  Vehicle,
  Quote,
  RepairOrder,
  Part,
  CompanySettings,
} from "@prisma/client";
import { Download } from "lucide-react";

// Extended type to include relations needed for PDF
type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: (InvoiceItem & { part?: Part | null })[];
  vehicle?: Vehicle | null;
  quote?: Quote | null;
  repairOrder?: RepairOrder | null;
};

interface InvoiceDownloadButtonImplProps {
  invoice: InvoiceWithRelations;
  companySettings?: CompanySettings | null;
}

export default function InvoiceDownloadButtonImpl({
  invoice,
  companySettings,
}: InvoiceDownloadButtonImplProps) {
  return (
    <PDFDownloadLink
      document={
        <InvoicePDF
          invoice={invoice as any}
          companySettings={companySettings}
        />
      }
      fileName={`Facture-${invoice.invoiceNumber}.pdf`}
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <Button disabled variant="outline">
            Génération PDF...
          </Button>
        ) : (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        )
      }
    </PDFDownloadLink>
  );
}
