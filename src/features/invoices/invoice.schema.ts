import { z } from "zod";

export const LineItemKindEnum = z.enum(["PART", "LABOR"]);

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  kind: LineItemKindEnum,
  partId: z.string().nullable().optional(),
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().min(0.01, "Quantité > 0"),
  unitPriceHt: z.coerce.number().min(0, "Prix ≥ 0"),
  vatRate: z.coerce.number().min(0).max(100),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Numéro requis"),
  customerId: z.string().min(1, "Client requis"),
  vehicleId: z.string().nullable().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Au moins une ligne requise"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>;
