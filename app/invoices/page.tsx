import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

export default async function InvoicesListPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, vehicle: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Factures</h1>
        <Link href="/invoices/new">
          <Button>Nouvelle Facture</Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant TTC</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  {invoice.issuedAt
                    ? new Date(invoice.issuedAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {invoice.customer.companyName ||
                    `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                </TableCell>
                <TableCell>
                  {invoice.vehicle
                    ? `${invoice.vehicle.make} ${invoice.vehicle.model}`
                    : "-"}
                </TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell className="text-right font-bold">
                  {Number(invoice.totalTtc).toFixed(2)} €
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/invoices/${invoice.id}`}>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
