"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { deleteInvoiceAction } from "@/app/invoices/actions";

interface DeleteInvoiceButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
}

export function DeleteInvoiceButton({
  invoiceId,
  invoiceNumber,
  status,
}: DeleteInvoiceButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const canDelete = status === "DRAFT" || status === "CANCELED";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInvoiceAction(invoiceId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        title="Annulez d'abord la facture"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer la facture{" "}
            <strong>{invoiceNumber}</strong>. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
