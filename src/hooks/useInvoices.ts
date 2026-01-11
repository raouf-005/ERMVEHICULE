"use client";

import useSWR, { mutate } from "swr";
import { fetcher } from "@/src/lib/fetcher";
import { useCallback, useTransition } from "react";

// Types for invoice data
export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELED";
  issuedAt: string | null;
  totalTtc: number;
  createdAt: string;
  createdById: string | null;
  groupId: string | null;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
  };
  vehicle: {
    id: string;
    registrationPlate: string;
  } | null;
}

export interface InvoicesStats {
  total: number;
  draft: number;
  issued: number;
  paid: number;
  totalPaid: number;
  totalPending: number;
}

export interface InvoicesResponse {
  invoices: InvoiceListItem[];
  stats: InvoicesStats;
}

/**
 * Hook for fetching invoices with SWR caching
 * Provides automatic revalidation and optimistic updates
 */
export function useInvoices() {
  const { data, error, isLoading, isValidating } = useSWR<InvoicesResponse>(
    "/api/invoices",
    fetcher,
    {
      // Revalidate every 30 seconds for real-time updates
      refreshInterval: 30000,
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep stale data while revalidating
      revalidateOnMount: true,
      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
    }
  );

  const refreshInvoices = useCallback(() => {
    mutate("/api/invoices");
  }, []);

  return {
    invoices: data?.invoices ?? [],
    stats: data?.stats ?? {
      total: 0,
      draft: 0,
      issued: 0,
      paid: 0,
      totalPaid: 0,
      totalPending: 0,
    },
    isLoading,
    isValidating,
    error,
    refreshInvoices,
  };
}

/**
 * Hook for fetching a single invoice
 */
export function useInvoice(id: string | null) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `/api/invoices/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const refreshInvoice = useCallback(() => {
    if (id) {
      mutate(`/api/invoices/${id}`);
    }
  }, [id]);

  return {
    invoice: data,
    isLoading,
    isValidating,
    error,
    refreshInvoice,
  };
}

/**
 * Hook for optimistic invoice status updates
 */
export function useUpdateInvoiceStatus() {
  const [isPending, startTransition] = useTransition();

  const updateStatus = useCallback(
    async (
      invoiceId: string,
      newStatus: "DRAFT" | "ISSUED" | "PAID" | "CANCELED"
    ) => {
      // Optimistic update - update local cache immediately
      mutate(
        "/api/invoices",
        (currentData: InvoicesResponse | undefined) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            invoices: currentData.invoices.map((inv) =>
              inv.id === invoiceId ? { ...inv, status: newStatus } : inv
            ),
          };
        },
        false // Don't revalidate yet
      );

      try {
        // Make the actual API call
        const res = await fetch(`/api/invoices/${invoiceId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error("Failed to update status");
        }

        // Revalidate to ensure consistency
        mutate("/api/invoices");
        mutate(`/api/invoices/${invoiceId}`);

        return true;
      } catch (error) {
        // Rollback on error by revalidating
        mutate("/api/invoices");
        throw error;
      }
    },
    []
  );

  return {
    updateStatus,
    isPending,
  };
}

/**
 * Hook for optimistic invoice deletion
 */
export function useDeleteInvoice() {
  const [isPending, startTransition] = useTransition();

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    // Optimistic update
    mutate(
      "/api/invoices",
      (currentData: InvoicesResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          invoices: currentData.invoices.filter((inv) => inv.id !== invoiceId),
        };
      },
      false
    );

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete invoice");
      }

      mutate("/api/invoices");
      return true;
    } catch (error) {
      mutate("/api/invoices");
      throw error;
    }
  }, []);

  return {
    deleteInvoice,
    isPending,
  };
}
