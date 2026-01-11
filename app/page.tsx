import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  FileText,
  Users,
  Car,
  Settings,
  Plus as PlusIcon,
  Euro,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { DashboardCharts } from "@/src/components/dashboard/DashboardCharts";

async function getDashboardStats() {
  // 1. Revenue (Paid Invoices)
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    select: { totalTtc: true, subtotalHt: true, paidAt: true },
  });
  const totalRevenue = paidInvoices.reduce(
    (acc, inv) => acc + Number(inv.totalTtc),
    0
  );
  const totalHt = paidInvoices.reduce(
    (acc, inv) => acc + Number(inv.subtotalHt),
    0
  );
  const totalVat = totalRevenue - totalHt;

  // 2. Pending Revenue (Issued Invoices)
  const pendingInvoices = await prisma.invoice.findMany({
    where: { status: "ISSUED" },
    select: { totalTtc: true },
  });
  const pendingAmount = pendingInvoices.reduce(
    (acc, inv) => acc + Number(inv.totalTtc),
    0
  );

  // 3. Invoice Counts by Status for Charts
  const statusCounts = await prisma.invoice.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statusMap = {
    DRAFT: "Brouillon",
    ISSUED: "Émise",
    PAID: "Payée",
    CANCELLED: "Annulée",
  };

  const invoiceStatusData = statusCounts.map((item) => ({
    name: statusMap[item.status as keyof typeof statusMap] || item.status,
    value: item._count.status,
  }));

  // 4. Monthly Revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentPaidInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: sixMonthsAgo },
    },
    select: { totalTtc: true, paidAt: true },
  });

  const monthlyData: { [key: string]: number } = {};
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${months[d.getMonth()]} ${d
      .getFullYear()
      .toString()
      .slice(-2)}`;
    monthlyData[key] = 0;
  }

  recentPaidInvoices.forEach((inv) => {
    if (inv.paidAt) {
      const d = new Date(inv.paidAt);
      const key = `${months[d.getMonth()]} ${d
        .getFullYear()
        .toString()
        .slice(-2)}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += Number(inv.totalTtc);
      }
    }
  });

  const monthlyRevenue = Object.entries(monthlyData).map(([name, amount]) => ({
    name,
    amount,
  }));

  // 5. Low Stock Parts
  const lowStockCount = await prisma.part.count({
    where: {
      stockQty: {
        lte: 5,
      },
    },
  });

  // 6. Recent Activity
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const invoiceCount = await prisma.invoice.count();
  const customerCount = await prisma.customer.count();
  const vehicleCount = await prisma.vehicle.count();

  // 7. Average Invoice Value
  const avgInvoiceValue =
    invoiceCount > 0 ? totalRevenue / paidInvoices.length : 0;

  return {
    totalRevenue,
    totalHt,
    totalVat,
    pendingAmount,
    lowStockCount,
    invoiceCount,
    customerCount,
    vehicleCount,
    avgInvoiceValue,
    recentInvoices,
    charts: {
      financials: [
        { name: "Payé", amount: totalRevenue },
        { name: "En Attente", amount: pendingAmount },
      ],
      invoiceStatus: invoiceStatusData,
      monthlyRevenue,
    },
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de l&apos;activité du garage
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/invoices/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Nouvelle Facture
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d&apos;Affaires
            </CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              HT:{" "}
              {stats.totalHt.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingAmount.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Factures émises non payées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoiceCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Moy:{" "}
              {stats.avgInvoiceValue.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              €
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients / Véhicules
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.customerCount} / {stats.vehicleCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base de données active
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            stats.lowStockCount > 0 ? "border-l-4 border-l-red-500" : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                stats.lowStockCount > 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.lowStockCount > 0 ? "text-red-600" : ""
              }`}
            >
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Articles à recommander
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        financials={stats.charts.financials}
        invoiceStatus={stats.charts.invoiceStatus}
        monthlyRevenue={stats.charts.monthlyRevenue}
      />

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/invoices">
          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Facturation</CardTitle>
                <CardDescription>Gérer les factures</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customers">
          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Clients</CardTitle>
                <CardDescription>
                  {stats.customerCount} enregistrés
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/vehicles">
          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Car className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Véhicules</CardTitle>
                <CardDescription>{stats.vehicleCount} en base</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full border-l-4 border-l-slate-500">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-slate-500/10 rounded-lg">
                <Settings className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Paramètres</CardTitle>
                <CardDescription>Configuration</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/invoices/new">
              <Button size="lg">
                <PlusIcon className="mr-2 h-4 w-4" /> Nouvelle Facture
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button size="lg" variant="secondary">
                <PlusIcon className="mr-2 h-4 w-4" /> Nouveau Client
              </Button>
            </Link>
            <Link href="/vehicles/new">
              <Button size="lg" variant="secondary">
                <PlusIcon className="mr-2 h-4 w-4" /> Nouveau Véhicule
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
