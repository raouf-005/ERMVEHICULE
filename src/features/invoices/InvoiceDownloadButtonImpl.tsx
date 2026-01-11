"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  InvoicePDF,
  InvoiceWithRelations,
} from "@/src/components/pdf/InvoicePDF";
import { Button } from "@/src/components/ui/button";
import { CompanySettings } from "@prisma/client";
import { Download } from "lucide-react";

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
        <InvoicePDF invoice={invoice} companySettings={companySettings} />
      }
      fileName={`Facture-${invoice.invoiceNumber}.pdf`}
    >
      {({ loading }) =>
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
