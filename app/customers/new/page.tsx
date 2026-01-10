import { createCustomerAction } from "./actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau Client</h1>
        <p className="text-muted-foreground">
          Remplissez les informations du client
        </p>
      </div>

      <form
        action={createCustomerAction}
        className="space-y-6 border p-6 rounded-lg bg-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input id="lastName" name="lastName" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Raison Sociale (Optionnel)</Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="SAS Garage..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input id="siret" name="siret" placeholder="123 456 789 00012" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">TVA Intracommunautaire</Label>
            <Input
              id="vatNumber"
              name="vatNumber"
              placeholder="FR 12 345678900"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Créer Client
          </Button>
        </div>
      </form>
    </div>
  );
}
