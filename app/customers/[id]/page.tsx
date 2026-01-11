import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";
import { updateCustomerAction } from "../actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeleteCustomerButton } from "./DeleteCustomerButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          vehicles: true,
          invoices: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const updateWithId = updateCustomerAction.bind(null, id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modifier le client</h1>
          <p className="text-muted-foreground">
            {customer.companyName ||
              `${customer.firstName} ${customer.lastName}`}
          </p>
        </div>
        <DeleteCustomerButton
          customerId={id}
          hasInvoices={customer._count.invoices > 0}
        />
      </div>

      <form action={updateWithId}>
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Identité du client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={customer.firstName || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={customer.lastName || ""}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={customer.companyName || ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={customer.phone || ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Adresse</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={customer.addressLine1 || ""}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={customer.postalCode || ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={customer.city || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  name="siret"
                  defaultValue={customer.siret || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">N° TVA</Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  defaultValue={customer.vatNumber || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {customer._count.vehicles} véhicule(s) • {customer._count.invoices}{" "}
            facture(s)
          </div>
          <Button type="submit" size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
