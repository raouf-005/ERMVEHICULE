"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteVehicleAction } from "../actions";

interface DeleteVehicleButtonProps {
  vehicleId: string;
  hasRelations: boolean;
}

export function DeleteVehicleButton({
  vehicleId,
  hasRelations,
}: DeleteVehicleButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVehicleAction(vehicleId);
        router.push("/vehicles");
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression");
      }
    });
  };

  if (hasRelations) {
    return (
      <Button
        variant="outline"
        disabled
        title="Ce véhicule a des documents associés"
      >
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
