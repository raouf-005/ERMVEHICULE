"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCustomerAction } from "../actions";

interface DeleteCustomerButtonProps {
  customerId: string;
  hasInvoices: boolean;
}

export function DeleteCustomerButton({
  customerId,
  hasInvoices,
}: DeleteCustomerButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCustomerAction(customerId);
        router.push("/customers");
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression");
      }
    });
  };

  if (hasInvoices) {
    return (
      <Button variant="outline" disabled title="Ce client a des factures">
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer (impossible)
      </Button>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Suppression..." : "Confirmer"}
        </Button>
        <Button variant="outline" onClick={() => setShowConfirm(false)}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={() => setShowConfirm(true)}>
      <Trash2 className="h-4 w-4 mr-2" />
      Supprimer
    </Button>
  );
}
