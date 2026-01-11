import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

// Cache tags for invalidation
export const CACHE_TAGS = {
  invoices: "invoices",
  customers: "customers",
  vehicles: "vehicles",
  parts: "parts",
  dashboard: "dashboard",
  users: "users",
  groups: "groups",
} as const;

// Cache durations (in seconds)
export const CACHE_DURATION = {
  short: 60, // 1 minute - for frequently changing data
  medium: 300, // 5 minutes - for moderately changing data
  long: 3600, // 1 hour - for rarely changing data
} as const;

// ============== DASHBOARD CACHE ==============

export const getCachedDashboardStats = unstable_cache(
  async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      paidStats,
      pendingStats,
      statusCounts,
      recentPaidInvoices,
      lowStockCount,
      recentInvoices,
      invoiceCount,
      customerCount,
      vehicleCount,
      paidInvoiceCount,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { totalTtc: true, subtotalHt: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "ISSUED" },
        _sum: { totalTtc: true },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.invoice.findMany({
        where: { status: "PAID", paidAt: { gte: sixMonthsAgo } },
        select: { totalTtc: true, paidAt: true },
      }),
      prisma.part.count({ where: { stockQty: { lte: 5 } } }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.invoice.count({ where: { status: "PAID" } }),
    ]);

    const totalRevenue = Number(paidStats._sum.totalTtc) || 0;
    const totalHt = Number(paidStats._sum.subtotalHt) || 0;
    const totalVat = totalRevenue - totalHt;
    const pendingAmount = Number(pendingStats._sum.totalTtc) || 0;

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

    const monthlyRevenue = Object.entries(monthlyData).map(
      ([name, amount]) => ({
        name,
        amount,
      })
    );

    const avgInvoiceValue =
      paidInvoiceCount > 0 ? totalRevenue / paidInvoiceCount : 0;

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
      recentInvoices: recentInvoices.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
        issuedAt: inv.issuedAt?.toISOString() ?? null,
        paidAt: inv.paidAt?.toISOString() ?? null,
        dueDate: inv.dueAt?.toISOString() ?? null,
      })),
      charts: {
        financials: [
          { name: "Payé", amount: totalRevenue },
          { name: "En Attente", amount: pendingAmount },
        ],
        invoiceStatus: invoiceStatusData,
        monthlyRevenue,
      },
    };
  },
  ["dashboard-stats"],
  {
    revalidate: CACHE_DURATION.short,
    tags: [CACHE_TAGS.dashboard, CACHE_TAGS.invoices],
  }
);

// ============== CUSTOMERS CACHE ==============

export const getCachedCustomers = unstable_cache(
  async () => {
    return prisma.customer.findMany({
      include: {
        vehicles: true,
        _count: { select: { invoices: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["customers-list"],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [CACHE_TAGS.customers],
  }
);

export const getCachedCustomerById = unstable_cache(
  async (id: string) => {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  },
  ["customer-by-id"],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [CACHE_TAGS.customers],
  }
);

// ============== VEHICLES CACHE ==============

export const getCachedVehicles = unstable_cache(
  async () => {
    return prisma.vehicle.findMany({
      include: {
        customer: true,
        _count: {
          select: { invoices: true, repairOrders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["vehicles-list"],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [CACHE_TAGS.vehicles],
  }
);

// ============== INVOICES CACHE ==============

export const getCachedInvoices = unstable_cache(
  async () => {
    return prisma.invoice.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["invoices-list"],
  {
    revalidate: CACHE_DURATION.short,
    tags: [CACHE_TAGS.invoices],
  }
);

// ============== COUNTS CACHE (for navigation badges) ==============

export const getCachedCounts = unstable_cache(
  async () => {
    const [invoices, customers, vehicles, lowStock] = await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.part.count({ where: { stockQty: { lte: 5 } } }),
    ]);
    return { invoices, customers, vehicles, lowStock };
  },
  ["global-counts"],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [
      CACHE_TAGS.invoices,
      CACHE_TAGS.customers,
      CACHE_TAGS.vehicles,
      CACHE_TAGS.parts,
    ],
  }
);
