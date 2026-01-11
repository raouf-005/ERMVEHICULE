"use client";

import { updateInvoiceStatusAction } from "./actions";
import { Button } from "@/src/components/ui/button";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "@/src/components/ui/simple-dropdown";
import { ChevronDown, CheckCircle, Ban, FileText } from "lucide-react";
import { useTransition } from "react";

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: string;
}

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
}: InvoiceStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await updateInvoiceStatusAction(invoiceId, status);
    });
  };

  return (
    <SimpleDropdown
      trigger={
        <Button variant="outline" disabled={isPending}>
          {currentStatus} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <SimpleDropdownItem onClick={() => handleStatusChange("DRAFT")}>
        <FileText className="mr-2 h-4 w-4" /> Brouillon
      </SimpleDropdownItem>
      <SimpleDropdownItem onClick={() => handleStatusChange("ISSUED")}>
        <CheckCircle className="mr-2 h-4 w-4" /> Emise / Validée
      </SimpleDropdownItem>
      <SimpleDropdownItem onClick={() => handleStatusChange("PAID")}>
        <span className="mr-2 font-bold text-green-600">€</span> Payée
      </SimpleDropdownItem>
      <SimpleDropdownItem
        onClick={() => handleStatusChange("CANCELED")}
        destructive
      >
        <Ban className="mr-2 h-4 w-4" /> Annulée
      </SimpleDropdownItem>
    </SimpleDropdown>
  );
}
