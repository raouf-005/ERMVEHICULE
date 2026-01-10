"use client";

import { updateInvoiceStatusAction } from "./actions";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          {currentStatus} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
          <FileText className="mr-2 h-4 w-4" /> Brouillon
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("ISSUED")}>
          <CheckCircle className="mr-2 h-4 w-4" /> Emise / Validée
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("PAID")}>
          <span className="mr-2 font-bold text-green-600">€</span> Payée
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange("CANCELED")}
          className="text-red-600"
        >
          <Ban className="mr-2 h-4 w-4" /> Annulée
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
