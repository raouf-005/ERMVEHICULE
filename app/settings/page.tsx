import { prisma } from "@/src/lib/prisma";
import { updateCompanySettingsAction } from "./actions";
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
import { Building2, MapPin, Receipt, FileImage } from "lucide-react";
import { CompanySettings } from "@prisma/client";

export default async function SettingsPage() {
  const settings: Partial<CompanySettings> =
    (await prisma.companySettings.findFirst()) || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres Entreprise</h1>
        <p className="text-muted-foreground mt-1">
          Ces informations apparaîtront sur vos factures et documents officiels.
        </p>
      </div>

      <form action={updateCompanySettingsAction} className="space-y-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <CardTitle>Identité</CardTitle>
              <CardDescription>Raison sociale et coordonnées</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={settings.name ?? ""}
                  required
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalStatus">Forme Juridique (ex: SASU)</Label>
                <Input
                  id="legalStatus"
                  name="legalStatus"
                  defaultValue={settings.legalStatus ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Capital Social</Label>
              <Input
                id="capital"
                name="capital"
                defaultValue={settings.capital ?? ""}
                placeholder="10 000 €"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <MapPin className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>Adresse et contact</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Adresse</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={settings.addressLine1 ?? ""}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={settings.postalCode ?? ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={settings.city ?? ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email contact</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.email ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={settings.phone ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://www.mongarage.fr"
                defaultValue={settings.website ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <Receipt className="h-8 w-8 text-orange-500" />
            <div>
              <CardTitle>Fiscalité</CardTitle>
              <CardDescription>Informations légales et TVA</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  name="siret"
                  defaultValue={settings.siret ?? ""}
                  placeholder="123 456 789 00012"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Numéro de TVA</Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  defaultValue={settings.vatNumber ?? ""}
                  placeholder="FR12345678901"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <FileImage className="h-8 w-8 text-purple-500" />
            <div>
              <CardTitle>Personnalisation PDF</CardTitle>
              <CardDescription>
                Logo et pied de page des factures
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL du logo</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                type="url"
                placeholder="https://exemple.com/logo.png"
                defaultValue={settings.logoUrl ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                URL publique de votre logo (format PNG ou JPG recommandé, max
                200x100px)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceFooter">Texte pied de page facture</Label>
              <Input
                id="invoiceFooter"
                name="invoiceFooter"
                placeholder="Conditions de paiement, mentions légales..."
                defaultValue={settings.invoiceFooter ?? ""}
              />
            </div>
            {settings.logoUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Aperçu du logo :</p>
                <img
                  src={settings.logoUrl}
                  alt="Logo entreprise"
                  className="max-h-20 max-w-48 object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
