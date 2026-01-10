"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import {
  invoiceFormSchema,
  type InvoiceFormValues,
  type InvoiceItemValues,
} from "./invoice.schema";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

// ───────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────

export interface PartOption {
  id: string;
  name: string;
  salePriceHt: number;
  vatRate: number;
  stockQty: number;
  lowStockThreshold: number;
}

export interface CustomerOption {
  id: string;
  label: string;
}

export interface VehicleOption {
  id: string;
  registrationPlate: string;
}

interface InvoiceFormProps {
  parts: PartOption[];
  customers: CustomerOption[];
  vehicles: VehicleOption[];
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmit: (data: InvoiceFormValues) => void | Promise<void>;
}

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

const emptyItem: InvoiceItemValues = {
  kind: "LABOR",
  partId: null,
  description: "",
  quantity: 1,
  unitPriceHt: 0,
  vatRate: 20,
};

function calcLineTotalHt(item: InvoiceItemValues): number {
  return item.quantity * item.unitPriceHt;
}

function calcLineTotalTtc(item: InvoiceItemValues): number {
  const ht = calcLineTotalHt(item);
  return ht * (1 + item.vatRate / 100);
}

// ───────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────

export function InvoiceForm({
  parts,
  customers,
  vehicles,
  defaultValues,
  onSubmit,
}: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      customerId: "",
      vehicleId: null,
      notes: "",
      items: [emptyItem],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch items for real-time totals
  const watchedItems = useWatch({ control, name: "items" });

  const totals = React.useMemo(() => {
    const items = watchedItems ?? [];
    let subtotalHt = 0;
    let vatTotal = 0;
    for (const item of items) {
      const lineHt = (item.quantity ?? 0) * (item.unitPriceHt ?? 0);
      const lineVat = lineHt * ((item.vatRate ?? 20) / 100);
      subtotalHt += lineHt;
      vatTotal += lineVat;
    }
    return {
      subtotalHt,
      vatTotal,
      totalTtc: subtotalHt + vatTotal,
    };
  }, [watchedItems]);

  // When user selects a part, prefill description + price
  const handlePartSelect = (index: number, partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (part) {
      setValue(`items.${index}.partId`, partId);
      setValue(`items.${index}.description`, part.name);
      setValue(`items.${index}.unitPriceHt`, part.salePriceHt);
      setValue(`items.${index}.vatRate`, part.vatRate);
      setValue(`items.${index}.kind`, "PART");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Informations Facture</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Invoice Number */}
          <div className="space-y-1">
            <Label htmlFor="invoiceNumber">N° Facture</Label>
            <Input id="invoiceNumber" {...register("invoiceNumber")} />
            {errors.invoiceNumber && (
              <p className="text-xs text-red-500">
                {errors.invoiceNumber.message}
              </p>
            )}
          </div>

          {/* Customer */}
          <div className="space-y-1">
            <Label>Client</Label>
            <Select
              onValueChange={(v) => setValue("customerId", v)}
              defaultValue={defaultValues?.customerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-xs text-red-500">
                {errors.customerId.message}
              </p>
            )}
          </div>

          {/* Vehicle */}
          <div className="space-y-1">
            <Label>Véhicule</Label>
            <Select
              onValueChange={(v) => setValue("vehicleId", v)}
              defaultValue={defaultValues?.vehicleId ?? undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optionnel" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.registrationPlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1 md:col-span-1">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Lignes</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append(emptyItem)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[180px]">Pièce</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[80px] text-right">Qté</TableHead>
                <TableHead className="w-[100px] text-right">PU HT</TableHead>
                <TableHead className="w-[70px] text-right">TVA %</TableHead>
                <TableHead className="w-[100px] text-right">Total HT</TableHead>
                <TableHead className="w-[100px] text-right">
                  Total TTC
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, idx) => {
                const item = watchedItems?.[idx] ?? field;
                const lineHt = calcLineTotalHt(item as InvoiceItemValues);
                const lineTtc = calcLineTotalTtc(item as InvoiceItemValues);
                const selectedPart = parts.find((p) => p.id === item.partId);
                const lowStock =
                  selectedPart &&
                  selectedPart.stockQty <= selectedPart.lowStockThreshold;

                return (
                  <TableRow key={field.id}>
                    {/* Kind */}
                    <TableCell>
                      <Select
                        defaultValue={field.kind}
                        onValueChange={(v) =>
                          setValue(`items.${idx}.kind`, v as "PART" | "LABOR")
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LABOR">MO</SelectItem>
                          <SelectItem value="PART">Pièce</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Part Selector */}
                    <TableCell>
                      <Select
                        onValueChange={(v) => handlePartSelect(idx, v)}
                        value={item.partId ?? undefined}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {parts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <span
                                className={
                                  p.stockQty <= p.lowStockThreshold
                                    ? "text-amber-600"
                                    : ""
                                }
                              >
                                {p.name} ({p.stockQty})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {lowStock && (
                        <span className="text-[10px] text-amber-600">
                          Stock faible
                        </span>
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      <Input
                        className="h-8 text-xs"
                        {...register(`items.${idx}.description`)}
                      />
                    </TableCell>

                    {/* Quantity */}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 w-full text-right text-xs"
                        {...register(`items.${idx}.quantity`)}
                      />
                    </TableCell>

                    {/* Unit Price HT */}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 w-full text-right text-xs"
                        {...register(`items.${idx}.unitPriceHt`)}
                      />
                    </TableCell>

                    {/* VAT Rate */}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="h-8 w-full text-right text-xs"
                        {...register(`items.${idx}.vatRate`)}
                      />
                    </TableCell>

                    {/* Computed HT */}
                    <TableCell className="text-right text-xs font-medium">
                      {lineHt.toFixed(2)} €
                    </TableCell>

                    {/* Computed TTC */}
                    <TableCell className="text-right text-xs font-medium">
                      {lineTtc.toFixed(2)} €
                    </TableCell>

                    {/* Remove */}
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">
                  Sous-total HT
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.subtotalHt.toFixed(2)} €
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">
                  TVA
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.vatTotal.toFixed(2)} €
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">
                  Total TTC
                </TableCell>
                <TableCell className="text-right text-lg font-bold">
                  {totals.totalTtc.toFixed(2)} €
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
        {errors.items && (
          <p className="px-6 pb-4 text-xs text-red-500">
            {errors.items.message ?? errors.items.root?.message}
          </p>
        )}
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer la Facture"}
        </Button>
      </div>
    </form>
  );
}
