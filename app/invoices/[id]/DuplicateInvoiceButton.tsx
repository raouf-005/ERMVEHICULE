"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { duplicateInvoiceAction } from "@/app/invoices/actions";

interface DuplicateInvoiceButtonProps {
  invoiceId: string;
}

export function DuplicateInvoiceButton({
  invoiceId,
}: DuplicateInvoiceButtonProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await duplicateInvoiceAction(invoiceId);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      setIsDuplicating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDuplicate}
      disabled={isDuplicating}
    >
      {isDuplicating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Duplication...
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Dupliquer
        </>
      )}
    </Button>
  );
}
